import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class LoyaltyService {
  private readonly logger = new Logger(LoyaltyService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getCustomerLoyalty(brandId: string, customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId, brand_id: brandId },
      include: {
        loyalty_ledger: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!customer) throw new Error('Customer not found');

    let lifetimeEarned = 0;
    let lifetimeRedeemed = 0;

    for (const entry of customer.loyalty_ledger) {
      if (entry.type === 'EARNED') lifetimeEarned += entry.points;
      if (entry.type === 'REDEEMED') lifetimeRedeemed += entry.points;
    }

    return {
      balance: customer.loyalty_points,
      lifetimeEarned,
      lifetimeRedeemed,
      ledger: customer.loyalty_ledger,
    };
  }

  async getCustomerLoyaltyByPhone(brandId: string, phone: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { brand_id_phone: { brand_id: brandId, phone } },
      include: {
        brand: true,
        loyalty_ledger: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!customer) throw new Error('Customer not found');

    // 1 point = 1 rupee equivalent (based on Phase 1 logic)
    const rupeeEquivalent = customer.loyalty_points;
    const eligibleToRedeem = customer.loyalty_points >= customer.brand.loyalty_min_redemption;

    let lifetimeEarned = 0;
    let lifetimeRedeemed = 0;

    for (const entry of customer.loyalty_ledger) {
      if (entry.type === 'EARNED') lifetimeEarned += entry.points;
      if (entry.type === 'REDEEMED') lifetimeRedeemed += entry.points;
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

  // Public-facing endpoint (no brand context — finds first matching phone)
  async getPublicLoyaltyByPhone(phone: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { phone },
    });

    if (!customer) return { balance: 0 };

    return {
      balance: customer.loyalty_points,
    };
  }

  // Monthly cron job to expire old points
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async expireOldPoints() {
    this.logger.log('Running points expiration cron job');
    const brands = await this.prisma.brand.findMany();

    for (const brand of brands) {
      const expiryMonths = brand.loyalty_expiry_months;
      if (expiryMonths <= 0) continue; // 0 could mean no expiry

      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - expiryMonths);

      // Find customers with balance > 0
      const customers = await this.prisma.customer.findMany({
        where: { brand_id: brand.id, loyalty_points: { gt: 0 } },
        include: {
          loyalty_ledger: {
            orderBy: { created_at: 'asc' }, // Get oldest first for FIFO
          },
        },
      });

      for (const customer of customers) {
        let totalConsumed = 0;
        const earnedEntries: any[] = [];

        for (const entry of customer.loyalty_ledger) {
          if (entry.type !== 'EARNED') {
            totalConsumed += entry.points;
          } else {
            earnedEntries.push(entry);
          }
        }

        let currentlyExpiring = 0;

        for (const entry of earnedEntries) {
          let availableFromEntry = entry.points;
          if (totalConsumed >= availableFromEntry) {
            totalConsumed -= availableFromEntry;
            availableFromEntry = 0;
          } else {
            availableFromEntry -= totalConsumed;
            totalConsumed = 0;
          }

          // If this entry still has points left and is older than cutoff
          if (availableFromEntry > 0 && entry.created_at < cutoffDate) {
            currentlyExpiring += availableFromEntry;
          }
        }

        if (currentlyExpiring > 0) {
          // Double check we don't expire more than their current balance
          const pointsToExpire = Math.min(currentlyExpiring, customer.loyalty_points);

          if (pointsToExpire > 0) {
            // Find brand's super admin for audit attribution
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
}
