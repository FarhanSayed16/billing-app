import { LoyaltyService } from './loyalty.service';
export declare class LoyaltyController {
    private readonly loyaltyService;
    constructor(loyaltyService: LoyaltyService);
    getPublicLoyaltyBalance(phone: string): Promise<{
        balance: number;
    }>;
    getCustomerLoyalty(req: any, customerId: string): Promise<{
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
    getLoyaltyByPhone(req: any, phone: string): Promise<{
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
}
