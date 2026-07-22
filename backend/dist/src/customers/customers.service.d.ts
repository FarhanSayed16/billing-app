import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersService {
    private prisma;
    constructor(prisma: PrismaService);
    createOrLookup(createCustomerDto: CreateCustomerDto, brandId: string): Promise<{
        id: any;
        name: any;
        phone: any;
        total_visits: any;
        loyalty_points: any;
    }>;
    lookup(phone: string, brandId: string): Promise<{
        id: any;
        name: any;
        phone: any;
        total_visits: any;
        loyalty_points: any;
    }>;
    findAll(brandId: string, search?: string, sortBy?: string, page?: number, limit?: number): Promise<{
        data: {
            id: any;
            name: any;
            phone: any;
            total_visits: any;
            loyalty_points: any;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            total_pages: number;
        };
    }>;
    findOne(id: string, brandId: string): Promise<{
        invoices: {
            id: string;
            brand_id: string;
            store_id: string;
            created_at: Date;
            grand_total: import("@prisma/client-runtime-utils").Decimal;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            invoice_number: string;
            billing_id: string;
            customer_id: string | null;
            employee_id: string;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            tax_amount: import("@prisma/client-runtime-utils").Decimal;
            discount_amount: import("@prisma/client-runtime-utils").Decimal;
            loyalty_points_redeemed: number;
            loyalty_discount: import("@prisma/client-runtime-utils").Decimal;
            loyalty_points_earned: number;
            share_triggered: boolean;
            invoice_pdf_url: string | null;
            qr_code_url: string | null;
        }[];
    } & {
        id: string;
        brand_id: string;
        name: string;
        phone: string;
        created_at: Date;
        updated_at: Date;
        total_visits: number;
        total_spend: import("@prisma/client-runtime-utils").Decimal;
        loyalty_points: number;
        first_visit_at: Date | null;
        last_visit_at: Date | null;
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, brandId: string): Promise<{
        id: string;
        brand_id: string;
        name: string;
        phone: string;
        created_at: Date;
        updated_at: Date;
        total_visits: number;
        total_spend: import("@prisma/client-runtime-utils").Decimal;
        loyalty_points: number;
        first_visit_at: Date | null;
        last_visit_at: Date | null;
    }>;
    private formatCustomer;
}
