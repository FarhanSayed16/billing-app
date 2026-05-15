import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(createCustomerDto: CreateCustomerDto, req: any): Promise<{
        id: any;
        name: any;
        phone: any;
        total_visits: any;
        loyalty_points: any;
    }>;
    lookup(phone: string, req: any): Promise<{
        id: any;
        name: any;
        phone: any;
        total_visits: any;
        loyalty_points: any;
    }>;
    findAll(req: any, search?: string, sortBy?: string, page?: number, limit?: number): Promise<{
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
    findOne(id: string, req: any): Promise<{
        invoices: {
            id: string;
            brand_id: string;
            created_at: Date;
            store_id: string;
            employee_id: string;
            invoice_number: string;
            billing_id: string;
            customer_id: string | null;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            tax_amount: import("@prisma/client-runtime-utils").Decimal;
            discount_amount: import("@prisma/client-runtime-utils").Decimal;
            loyalty_points_redeemed: number;
            loyalty_discount: import("@prisma/client-runtime-utils").Decimal;
            grand_total: import("@prisma/client-runtime-utils").Decimal;
            loyalty_points_earned: number;
            status: import("@prisma/client").$Enums.InvoiceStatus;
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
    update(id: string, updateCustomerDto: UpdateCustomerDto, req: any): Promise<{
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
}
