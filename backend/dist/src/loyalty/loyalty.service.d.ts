import { PrismaService } from '../prisma/prisma.service';
export declare class LoyaltyService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getCustomerLoyalty(brandId: string, customerId: string): Promise<{
        balance: number;
        lifetimeEarned: number;
        lifetimeRedeemed: number;
        ledger: {
            id: string;
            created_at: Date;
            customer_id: string;
            invoice_id: string | null;
            type: import("@prisma/client").$Enums.LedgerType;
            points: number;
            description: string | null;
        }[];
    }>;
    getCustomerLoyaltyByPhone(brandId: string, phone: string): Promise<{
        balance: number;
        rupeeEquivalent: number;
        eligibleToRedeem: boolean;
        minRedemptionThreshold: number;
        customer: {
            name: string;
            phone: string;
        };
        lifetimeEarned: number;
        lifetimeRedeemed: number;
        ledger: {
            id: string;
            created_at: Date;
            customer_id: string;
            invoice_id: string | null;
            type: import("@prisma/client").$Enums.LedgerType;
            points: number;
            description: string | null;
        }[];
    }>;
    getPublicLoyaltyByPhone(phone: string): Promise<{
        balance: number;
    }>;
    expireOldPoints(): Promise<void>;
}
