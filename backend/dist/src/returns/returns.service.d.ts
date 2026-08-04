import { PrismaService } from '../prisma/prisma.service';
import { CreateReturnDto } from './dto/create-return.dto';
export declare class ReturnsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createReturn(user: any, dto: CreateReturnDto): Promise<{
        message: string;
        returnRequest: {
            id: string;
            brand_id: string;
            created_at: Date;
            updated_at: Date;
            store_id: string;
            status: string;
            employee_id: string;
            invoice_id: string;
            reason: string | null;
            refund_amount: import("@prisma/client/runtime/library").Decimal;
            loyalty_points_reversed: number;
        };
    }>;
    getPendingReturns(storeId: string, brandId: string): Promise<({
        employee: {
            name: string;
        };
        items: ({
            invoice_item: {
                id: string;
                name: string;
                tax_rate: import("@prisma/client/runtime/library").Decimal;
                quantity: number;
                product_id: string | null;
                tax_amount: import("@prisma/client/runtime/library").Decimal;
                unit_price: import("@prisma/client/runtime/library").Decimal;
                total: import("@prisma/client/runtime/library").Decimal;
                returned_quantity: number;
                invoice_id: string;
            };
        } & {
            id: string;
            quantity: number;
            invoice_item_id: string;
            return_request_id: string;
        })[];
        invoice: {
            customer: {
                name: string;
                phone: string;
            } | null;
            billing_id: string;
        };
    } & {
        id: string;
        brand_id: string;
        created_at: Date;
        updated_at: Date;
        store_id: string;
        status: string;
        employee_id: string;
        invoice_id: string;
        reason: string | null;
        refund_amount: import("@prisma/client/runtime/library").Decimal;
        loyalty_points_reversed: number;
    })[]>;
    approveReturn(user: any, requestId: string): Promise<{
        message: string;
    }>;
    rejectReturn(user: any, requestId: string): Promise<{
        message: string;
    }>;
    private _executeApprovalLogic;
}
