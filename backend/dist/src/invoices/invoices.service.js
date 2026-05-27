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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const billing_id_util_1 = require("./utils/billing-id.util");
const invoice_number_util_1 = require("./utils/invoice-number.util");
const pdf_service_1 = require("./pdf.service");
const client_1 = require("@prisma/client");
let InvoicesService = class InvoicesService {
    prisma;
    pdfService;
    constructor(prisma, pdfService) {
        this.prisma = prisma;
        this.pdfService = pdfService;
    }
    async create(createInvoiceDto, storeId, employeeId, brandId) {
        return this.prisma.$transaction(async (tx) => {
            const store = await tx.store.findUnique({ where: { id: storeId }, include: { brand: true } });
            if (!store)
                throw new common_1.NotFoundException('Store not found');
            let customerId = createInvoiceDto.customer_id;
            let existingCustomer = null;
            if (!customerId && createInvoiceDto.customer_phone) {
                existingCustomer = await tx.customer.findUnique({
                    where: { brand_id_phone: { brand_id: brandId, phone: createInvoiceDto.customer_phone } }
                });
                if (!existingCustomer) {
                    existingCustomer = await tx.customer.create({
                        data: {
                            brand_id: brandId,
                            phone: createInvoiceDto.customer_phone,
                            name: createInvoiceDto.customer_name || 'Guest User',
                        }
                    });
                }
                customerId = existingCustomer.id;
            }
            else if (customerId) {
                existingCustomer = await tx.customer.findUnique({ where: { id: customerId } });
                if (!existingCustomer || existingCustomer.brand_id !== brandId) {
                    throw new common_1.BadRequestException('Invalid customer ID');
                }
            }
            let subtotal = 0;
            let taxAmount = 0;
            const invoiceItemsInput = createInvoiceDto.items.map(item => {
                const itemTax = item.quantity * item.unit_price * (item.tax_rate / 100);
                const itemTotal = (item.quantity * item.unit_price) + itemTax;
                subtotal += (item.quantity * item.unit_price);
                taxAmount += itemTax;
                return {
                    product_id: item.product_id || null,
                    name: item.name,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    tax_rate: item.tax_rate,
                    tax_amount: itemTax,
                    total: itemTotal,
                };
            });
            const redeemedPoints = createInvoiceDto.loyalty_points_redeemed || 0;
            let loyaltyDiscount = 0;
            if (redeemedPoints > 0) {
                if (!existingCustomer || existingCustomer.loyalty_points < redeemedPoints) {
                    throw new common_1.BadRequestException('Insufficient loyalty points');
                }
                if (redeemedPoints < store.brand.loyalty_min_redemption) {
                    throw new common_1.BadRequestException(`Minimum points to redeem is ${store.brand.loyalty_min_redemption}`);
                }
                loyaltyDiscount = redeemedPoints * 1;
            }
            const discountAmount = createInvoiceDto.discount_amount || 0;
            const grandTotal = subtotal + taxAmount - discountAmount - loyaltyDiscount;
            if (grandTotal < 0)
                throw new common_1.BadRequestException('Grand total cannot be negative');
            const earnedPoints = Math.floor(grandTotal / 100) * store.brand.loyalty_points_per_100;
            let billingId = (0, billing_id_util_1.generateBillingId)();
            let unique = false;
            while (!unique) {
                const existing = await tx.invoice.findUnique({ where: { billing_id: billingId } });
                if (!existing)
                    unique = true;
                else
                    billingId = (0, billing_id_util_1.generateBillingId)();
            }
            await tx.$queryRaw `SELECT id FROM stores WHERE id = ${storeId}::uuid FOR UPDATE`;
            const currentYear = new Date().getFullYear();
            const seqResult = await tx.$queryRaw `
        SELECT COUNT(*) + 1 as seq FROM invoices
        WHERE store_id = ${storeId}::uuid
        AND created_at >= ${new Date(currentYear, 0, 1)}
      `;
            const seqNumber = Number(seqResult[0]?.seq ?? 1);
            const invoiceNumber = (0, invoice_number_util_1.generateInvoiceNumber)(store.name, currentYear, seqNumber);
            const invoice = await tx.invoice.create({
                data: {
                    brand_id: brandId,
                    store_id: storeId,
                    employee_id: employeeId,
                    customer_id: customerId,
                    billing_id: billingId,
                    invoice_number: invoiceNumber,
                    subtotal,
                    tax_amount: taxAmount,
                    discount_amount: discountAmount,
                    loyalty_points_redeemed: redeemedPoints,
                    loyalty_discount: loyaltyDiscount,
                    grand_total: grandTotal,
                    loyalty_points_earned: earnedPoints,
                    items: {
                        create: invoiceItemsInput
                    }
                },
                include: {
                    items: true,
                    customer: true,
                    store: true,
                }
            });
            if (customerId && existingCustomer) {
                await tx.customer.update({
                    where: { id: customerId },
                    data: {
                        total_visits: { increment: 1 },
                        total_spend: { increment: grandTotal },
                        last_visit_at: new Date(),
                        loyalty_points: { increment: earnedPoints - redeemedPoints }
                    }
                });
                if (redeemedPoints > 0) {
                    await tx.loyaltyLedger.create({
                        data: {
                            customer_id: customerId,
                            invoice_id: invoice.id,
                            points: -redeemedPoints,
                            type: client_1.LedgerType.REDEEMED,
                        }
                    });
                }
                if (earnedPoints > 0) {
                    await tx.loyaltyLedger.create({
                        data: {
                            customer_id: customerId,
                            invoice_id: invoice.id,
                            points: earnedPoints,
                            type: client_1.LedgerType.EARNED,
                        }
                    });
                }
            }
            await tx.auditLog.create({
                data: {
                    brand_id: brandId,
                    user_id: employeeId,
                    action: 'INVOICE_CREATED',
                    target_type: 'Invoice',
                    target_id: invoice.id,
                }
            });
            return invoice;
        });
    }
    async findAll(brandId, query, role, storeId, employeeId) {
        const { page = 1, limit = 10, date_from, date_to, status, q_store_id, q_customer_id, q_employee_id, customer_search } = query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (role === client_1.Role.EMPLOYEE) {
            where.employee_id = employeeId;
            where.store_id = storeId;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            where.created_at = { gte: today };
        }
        else if (role === client_1.Role.STORE_ADMIN) {
            where.store_id = storeId;
        }
        else if (role === client_1.Role.SUPER_ADMIN) {
            where.brand_id = brandId;
            if (q_store_id)
                where.store_id = q_store_id;
        }
        if (date_from)
            where.created_at = { ...where.created_at, gte: new Date(date_from) };
        if (date_to)
            where.created_at = { ...where.created_at, lte: new Date(date_to) };
        if (status)
            where.status = status;
        if (q_customer_id)
            where.customer_id = q_customer_id;
        if (q_employee_id && role !== client_1.Role.EMPLOYEE)
            where.employee_id = q_employee_id;
        if (customer_search) {
            where.customer = {
                OR: [
                    { name: { contains: customer_search, mode: 'insensitive' } },
                    { phone: { contains: customer_search, mode: 'insensitive' } }
                ]
            };
        }
        const [data, total] = await Promise.all([
            this.prisma.invoice.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { created_at: 'desc' },
                include: { customer: { select: { name: true } } }
            }),
            this.prisma.invoice.count({ where })
        ]);
        return {
            data: data.map(inv => ({
                id: inv.id,
                invoice_number: inv.invoice_number,
                billing_id: inv.billing_id,
                customer_name: inv.customer?.name || 'Guest User',
                grand_total: inv.grand_total,
                created_at: inv.created_at,
                status: inv.status
            })),
            meta: { total, page: Number(page), limit: Number(limit) }
        };
    }
    async findOne(id, role, userStoreId, userId) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: { items: true, customer: true, store: true }
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        if (role === client_1.Role.EMPLOYEE && invoice.employee_id !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (role === client_1.Role.STORE_ADMIN && invoice.store_id !== userStoreId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return invoice;
    }
    async findOneByBillingId(billingId) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { billing_id: billingId },
            select: {
                billing_id: true,
                invoice_number: true,
                subtotal: true,
                tax_amount: true,
                discount_amount: true,
                loyalty_discount: true,
                grand_total: true,
                status: true,
                created_at: true,
                items: {
                    select: {
                        name: true,
                        quantity: true,
                        unit_price: true,
                        tax_rate: true,
                        tax_amount: true,
                        total: true,
                    }
                },
                store: {
                    select: {
                        name: true,
                        logo_url: true,
                        address: true,
                        city: true,
                        phone: true,
                        gst_number: true,
                        brand_color: true,
                    }
                },
                customer: {
                    select: { name: true, phone: true }
                }
            }
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        return invoice;
    }
    async findCustomerSummary(phone) {
        const invoices = await this.prisma.invoice.findMany({
            where: { customer: { phone }, status: { in: [client_1.InvoiceStatus.ACTIVE, client_1.InvoiceStatus.PARTIALLY_REFUNDED] } },
            select: {
                created_at: true,
                grand_total: true,
                billing_id: true,
                store: { select: { name: true } }
            },
            orderBy: { created_at: 'desc' },
            take: 50
        });
        return invoices.map(inv => ({
            invoice_date: inv.created_at,
            store_name: inv.store?.name,
            grand_total: inv.grand_total,
            billing_id: inv.billing_id,
        }));
    }
    async voidInvoice(id, storeId, userId) {
        return this.prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.findUnique({ where: { id } });
            if (!invoice)
                throw new common_1.NotFoundException('Invoice not found');
            if (invoice.store_id !== storeId)
                throw new common_1.ForbiddenException('Access denied');
            if (invoice.status === client_1.InvoiceStatus.FULLY_REFUNDED)
                throw new common_1.BadRequestException('Invoice is already voided');
            await tx.invoice.update({
                where: { id },
                data: { status: client_1.InvoiceStatus.FULLY_REFUNDED }
            });
            if (invoice.customer_id) {
                const store = await tx.store.findUnique({ where: { id: storeId }, include: { brand: true } });
                const pointsReversal = Math.floor(Number(invoice.grand_total) / 100) * (store?.brand.loyalty_points_per_100 || 1);
                await tx.customer.update({
                    where: { id: invoice.customer_id },
                    data: {
                        total_spend: { decrement: invoice.grand_total },
                        loyalty_points: { decrement: pointsReversal }
                    }
                });
                await tx.loyaltyLedger.create({
                    data: {
                        customer_id: invoice.customer_id,
                        invoice_id: invoice.id,
                        points: -pointsReversal,
                        type: client_1.LedgerType.ADJUSTED,
                    }
                });
            }
            await tx.auditLog.create({
                data: {
                    brand_id: invoice.brand_id,
                    user_id: userId,
                    action: 'INVOICE_VOIDED',
                    target_type: 'Invoice',
                    target_id: invoice.id,
                }
            });
            return { message: 'Invoice voided successfully' };
        });
    }
    async getGeneratePdf(id, role, userStoreId, userId) {
        const invoice = await this.findOne(id, role, userStoreId, userId);
        if (invoice.invoice_pdf_url) {
            return { url: invoice.invoice_pdf_url };
        }
        const s3Url = await this.pdfService.generateInvoicePdf(invoice);
        await this.prisma.invoice.update({
            where: { id },
            data: { invoice_pdf_url: s3Url }
        });
        return { url: s3Url };
    }
    async markShared(id) {
        const invoice = await this.prisma.invoice.findUnique({ where: { id } });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        await this.prisma.invoice.update({
            where: { id },
            data: { share_triggered: true },
        });
        return { message: 'Invoice marked as shared' };
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, pdf_service_1.PdfService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map