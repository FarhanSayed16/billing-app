"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReturnsService = class ReturnsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createReturn(user, dto) {
        const { brand_id, store_id, id: employee_id } = user;
        const brand = await this.prisma.brand.findUnique({
            where: { id: brand_id },
            select: { return_auto_approve_threshold: true, loyalty_points_per_100: true },
        });
        if (!brand)
            throw new common_1.BadRequestException('Brand config not found');
        const invoice = await this.prisma.invoice.findUnique({
            where: { billing_id: dto.billing_id },
            include: { items: true },
        });
        if (!invoice || invoice.store_id !== store_id) {
            throw new common_1.NotFoundException('Invoice not found in this store');
        }
        if (invoice.status === 'FULLY_REFUNDED') {
            throw new common_1.BadRequestException('Invoice is already fully refunded');
        }
        let refundAmount = 0;
        const returnItemsData = [];
        for (const returnItem of dto.items) {
            const originalItem = invoice.items.find(i => i.id === returnItem.invoice_item_id);
            if (!originalItem) {
                throw new common_1.BadRequestException(`Item ${returnItem.invoice_item_id} not found on invoice`);
            }
            const availableToReturn = originalItem.quantity - originalItem.returned_quantity;
            if (returnItem.quantity > availableToReturn) {
                throw new common_1.BadRequestException(`Cannot return ${returnItem.quantity} of ${originalItem.name}. Only ${availableToReturn} available.`);
            }
            const unitRefundData = Number(originalItem.total) / originalItem.quantity;
            refundAmount += unitRefundData * returnItem.quantity;
            returnItemsData.push({
                invoice_item_id: originalItem.id,
                quantity: returnItem.quantity,
            });
        }
        const maxPointsReversible = invoice.loyalty_points_earned;
        let pointsReversed = Math.floor(refundAmount / 100) * (brand.loyalty_points_per_100 || 1);
        if (pointsReversed > maxPointsReversible)
            pointsReversed = maxPointsReversible;
        const autoApprove = refundAmount <= Number(brand.return_auto_approve_threshold);
        const newStatus = autoApprove ? 'APPROVED' : 'PENDING';
        const returnRequest = await this.prisma.$transaction(async (tx) => {
            const request = await tx.returnRequest.create({
                data: {
                    invoice_id: invoice.id,
                    store_id,
                    brand_id,
                    employee_id,
                    status: newStatus,
                    refund_amount: refundAmount,
                    loyalty_points_reversed: pointsReversed,
                    reason: dto.reason,
                    items: {
                        create: returnItemsData,
                    },
                },
            });
            if (autoApprove) {
                await this._executeApprovalLogic(tx, request.id, invoice, returnItemsData, pointsReversed, employee_id, brand_id);
            }
            else {
                await tx.auditLog.create({
                    data: {
                        brand_id,
                        user_id: employee_id,
                        action: 'RETURN_SUBMITTED',
                        target_type: 'Invoice',
                        target_id: invoice.id,
                        metadata: { returnRequestId: request.id, refundAmount: refundAmount, status: 'PENDING' },
                    },
                });
            }
            return request;
        });
        return {
            message: autoApprove ? 'Return approved and processed successfully' : 'Return submitted for approval',
            returnRequest,
        };
    }
    async getPendingReturns(storeId, brandId) {
        return this.prisma.returnRequest.findMany({
            where: { store_id: storeId, brand_id: brandId, status: 'PENDING' },
            include: {
                items: { include: { invoice_item: true } },
                invoice: { select: { billing_id: true, customer: { select: { name: true, phone: true } } } },
                employee: { select: { name: true } },
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async approveReturn(user, requestId) {
        const request = await this.prisma.returnRequest.findUnique({
            where: { id: requestId },
            include: { items: true, invoice: { include: { items: true } } },
        });
        if (!request || request.brand_id !== user.brand_id)
            throw new common_1.NotFoundException('Return request not found');
        if (request.status !== 'PENDING')
            throw new common_1.BadRequestException(`Request is already ${request.status}`);
        await this.prisma.$transaction(async (tx) => {
            await tx.returnRequest.update({
                where: { id: requestId },
                data: { status: 'APPROVED' },
            });
            await this._executeApprovalLogic(tx, requestId, request.invoice, request.items, request.loyalty_points_reversed, user.id, user.brand_id);
        });
        return { message: 'Return request approved successfully' };
    }
    async rejectReturn(user, requestId) {
        const request = await this.prisma.returnRequest.findUnique({
            where: { id: requestId },
        });
        if (!request || request.brand_id !== user.brand_id)
            throw new common_1.NotFoundException('Return request not found');
        if (request.status !== 'PENDING')
            throw new common_1.BadRequestException(`Request is already ${request.status}`);
        await this.prisma.$transaction(async (tx) => {
            await tx.returnRequest.update({
                where: { id: requestId },
                data: { status: 'REJECTED' },
            });
            await tx.auditLog.create({
                data: {
                    brand_id: request.brand_id,
                    user_id: user.id,
                    action: 'RETURN_REJECTED',
                    target_type: 'Invoice',
                    target_id: request.invoice_id,
                    metadata: { returnRequestId: requestId },
                },
            });
        });
        return { message: 'Return request rejected' };
    }
    async _executeApprovalLogic(tx, requestId, invoice, returnItemsData, pointsReversed, adminId, brandId) {
        let totalItemsInInvoice = 0;
        let totalItemsReturnedSoFar = 0;
        for (const item of invoice.items) {
            totalItemsInInvoice += item.quantity;
            totalItemsReturnedSoFar += item.returned_quantity;
        }
        let newlyReturnedSum = 0;
        for (const returnItem of returnItemsData) {
            newlyReturnedSum += returnItem.quantity;
            await tx.invoiceItem.update({
                where: { id: returnItem.invoice_item_id },
                data: { returned_quantity: { increment: returnItem.quantity } },
            });
        }
        totalItemsReturnedSoFar += newlyReturnedSum;
        const invoiceStatus = totalItemsReturnedSoFar >= totalItemsInInvoice ? 'FULLY_REFUNDED' : 'PARTIALLY_REFUNDED';
        await tx.invoice.update({
            where: { id: invoice.id },
            data: { status: invoiceStatus },
        });
        if (pointsReversed > 0 && invoice.customer_id) {
            await tx.customer.update({
                where: { id: invoice.customer_id },
                data: { loyalty_points: { decrement: pointsReversed } },
            });
            await tx.loyaltyLedger.create({
                data: {
                    customer_id: invoice.customer_id,
                    invoice_id: invoice.id,
                    type: 'ADJUSTED',
                    points: -pointsReversed,
                    description: `Reversal for returned items on ${invoice.billing_id}`,
                },
            });
        }
        await tx.auditLog.create({
            data: {
                brand_id: brandId,
                user_id: adminId,
                action: 'RETURN_APPROVED',
                target_type: 'Invoice',
                target_id: invoice.id,
                metadata: { returnRequestId: requestId },
            },
        });
    }
};
exports.ReturnsService = ReturnsService;
exports.ReturnsService = ReturnsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReturnsService);
//# sourceMappingURL=returns.service.js.map