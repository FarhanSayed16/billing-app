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
var LoyaltyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoyaltyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const schedule_1 = require("@nestjs/schedule");
let LoyaltyService = LoyaltyService_1 = class LoyaltyService {
    prisma;
    logger = new common_1.Logger(LoyaltyService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCustomerLoyalty(brandId, customerId) {
        const customer = await this.prisma.customer.findUnique({
            where: { id: customerId, brand_id: brandId },
            include: {
                loyalty_ledger: {
                    orderBy: { created_at: 'desc' },
                },
            },
        });
        if (!customer)
            throw new Error('Customer not found');
        let lifetimeEarned = 0;
        let lifetimeRedeemed = 0;
        for (const entry of customer.loyalty_ledger) {
            if (entry.type === 'EARNED')
                lifetimeEarned += entry.points;
            if (entry.type === 'REDEEMED')
                lifetimeRedeemed += entry.points;
        }
        return {
            balance: customer.loyalty_points,
            lifetimeEarned,
            lifetimeRedeemed,
            ledger: customer.loyalty_ledger,
        };
    }
    async getCustomerLoyaltyByPhone(brandId, phone) {
        const customer = await this.prisma.customer.findUnique({
            where: { brand_id_phone: { brand_id: brandId, phone } },
            include: {
                brand: true,
                loyalty_ledger: {
                    orderBy: { created_at: 'desc' },
                },
            },
        });
        if (!customer)
            throw new Error('Customer not found');
        const rupeeEquivalent = customer.loyalty_points;
        const eligibleToRedeem = customer.loyalty_points >= customer.brand.loyalty_min_redemption;
        let lifetimeEarned = 0;
        let lifetimeRedeemed = 0;
        for (const entry of customer.loyalty_ledger) {
            if (entry.type === 'EARNED')
                lifetimeEarned += entry.points;
            if (entry.type === 'REDEEMED')
                lifetimeRedeemed += entry.points;
        }
        return {
            balance: customer.loyalty_points,
            rupeeEquivalent,
            eligibleToRedeem,
            minRedemptionThreshold: customer.brand.loyalty_min_redemption,
            customer: { name: customer.name, phone: customer.phone },
            lifetimeEarned,
            lifetimeRedeemed,
            ledger: customer.loyalty_ledger,
        };
    }
    async getPublicLoyaltyByPhone(phone) {
        const customer = await this.prisma.customer.findFirst({
            where: { phone },
        });
        if (!customer)
            return { balance: 0 };
        return {
            balance: customer.loyalty_points,
        };
    }
    async expireOldPoints() {
        this.logger.log('Running points expiration cron job');
        const brands = await this.prisma.brand.findMany();
        for (const brand of brands) {
            const expiryMonths = brand.loyalty_expiry_months;
            if (expiryMonths <= 0)
                continue;
            const cutoffDate = new Date();
            cutoffDate.setMonth(cutoffDate.getMonth() - expiryMonths);
            const customers = await this.prisma.customer.findMany({
                where: { brand_id: brand.id, loyalty_points: { gt: 0 } },
                include: {
                    loyalty_ledger: {
                        orderBy: { created_at: 'asc' },
                    },
                },
            });
            for (const customer of customers) {
                let totalConsumed = 0;
                const earnedEntries = [];
                for (const entry of customer.loyalty_ledger) {
                    if (entry.type !== 'EARNED') {
                        totalConsumed += entry.points;
                    }
                    else {
                        earnedEntries.push(entry);
                    }
                }
                let currentlyExpiring = 0;
                for (const entry of earnedEntries) {
                    let availableFromEntry = entry.points;
                    if (totalConsumed >= availableFromEntry) {
                        totalConsumed -= availableFromEntry;
                        availableFromEntry = 0;
                    }
                    else {
                        availableFromEntry -= totalConsumed;
                        totalConsumed = 0;
                    }
                    if (availableFromEntry > 0 && entry.created_at < cutoffDate) {
                        currentlyExpiring += availableFromEntry;
                    }
                }
                if (currentlyExpiring > 0) {
                    const pointsToExpire = Math.min(currentlyExpiring, customer.loyalty_points);
                    if (pointsToExpire > 0) {
                        const superAdmin = await this.prisma.user.findFirst({
                            where: { brand_id: brand.id, role: 'SUPER_ADMIN' },
                            select: { id: true },
                        });
                        await this.prisma.$transaction(async (tx) => {
                            await tx.customer.update({
                                where: { id: customer.id },
                                data: { loyalty_points: { decrement: pointsToExpire } },
                            });
                            await tx.loyaltyLedger.create({
                                data: {
                                    customer_id: customer.id,
                                    type: 'EXPIRED',
                                    points: pointsToExpire,
                                    description: `Points expired after ${expiryMonths} months`,
                                },
                            });
                            if (superAdmin) {
                                await tx.auditLog.create({
                                    data: {
                                        brand_id: brand.id,
                                        user_id: superAdmin.id,
                                        action: 'LOYALTY_POINTS_EXPIRED',
                                        target_type: 'Customer',
                                        target_id: customer.id,
                                        metadata: { pointsExpired: pointsToExpire, expiryMonths },
                                    },
                                });
                            }
                        });
                        this.logger.log(`Expired ${pointsToExpire} points for customer ${customer.id}`);
                    }
                }
            }
        }
        this.logger.log('Finished points expiration cron job');
    }
};
exports.LoyaltyService = LoyaltyService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoyaltyService.prototype, "expireOldPoints", null);
exports.LoyaltyService = LoyaltyService = LoyaltyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LoyaltyService);
//# sourceMappingURL=loyalty.service.js.map