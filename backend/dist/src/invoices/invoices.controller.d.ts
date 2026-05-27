import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    findOnePublic(billingId: string): Promise<{
        created_at: Date;
        store: {
            name: string;
            address: string;
            city: string;
            gst_number: string | null;
            phone: string;
            logo_url: string | null;
            brand_color: string | null;
        };
        invoice_number: string;
        billing_id: string;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        tax_amount: import("@prisma/client-runtime-utils").Decimal;
        discount_amount: import("@prisma/client-runtime-utils").Decimal;
        loyalty_discount: import("@prisma/client-runtime-utils").Decimal;
        grand_total: import("@prisma/client-runtime-utils").Decimal;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        items: {
            name: string;
            tax_amount: import("@prisma/client-runtime-utils").Decimal;
            quantity: number;
            unit_price: import("@prisma/client-runtime-utils").Decimal;
            tax_rate: import("@prisma/client-runtime-utils").Decimal;
            total: import("@prisma/client-runtime-utils").Decimal;
        }[];
        customer: {
            name: string;
            phone: string;
        } | null;
    }>;
    findCustomerSummary(phone: string): Promise<{
        invoice_date: Date;
        store_name: string;
        grand_total: import("@prisma/client-runtime-utils").Decimal;
        billing_id: string;
    }[]>;
    create(createInvoiceDto: CreateInvoiceDto, req: any): Promise<{
        store: {
            name: string;
            id: string;
            address: string;
            city: string;
            state: string;
            gst_number: string | null;
            phone: string;
            logo_url: string | null;
            brand_color: string | null;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            brand_id: string;
        };
        items: {
            name: string;
            id: string;
            tax_amount: import("@prisma/client-runtime-utils").Decimal;
            quantity: number;
            unit_price: import("@prisma/client-runtime-utils").Decimal;
            tax_rate: import("@prisma/client-runtime-utils").Decimal;
            total: import("@prisma/client-runtime-utils").Decimal;
            returned_quantity: number;
            product_id: string | null;
            invoice_id: string;
        }[];
        customer: {
            name: string;
            id: string;
            phone: string;
            created_at: Date;
            updated_at: Date;
            brand_id: string;
            total_visits: number;
            total_spend: import("@prisma/client-runtime-utils").Decimal;
            loyalty_points: number;
            first_visit_at: Date | null;
            last_visit_at: Date | null;
        } | null;
    } & {
        id: string;
        created_at: Date;
        brand_id: string;
        store_id: string;
        invoice_number: string;
        billing_id: string;
        customer_id: string | null;
        employee_id: string;
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
    }>;
    findAll(req: any, query: any): Promise<{
        data: {
            id: string;
            invoice_number: string;
            billing_id: string;
            customer_name: string;
            grand_total: import("@prisma/client-runtime-utils").Decimal;
            created_at: Date;
            status: import("@prisma/client").$Enums.InvoiceStatus;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
        };
    }>;
    findOne(id: string, req: any): Promise<{
        store: {
            name: string;
            id: string;
            address: string;
            city: string;
            state: string;
            gst_number: string | null;
            phone: string;
            logo_url: string | null;
            brand_color: string | null;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            brand_id: string;
        };
        items: {
            name: string;
            id: string;
            tax_amount: import("@prisma/client-runtime-utils").Decimal;
            quantity: number;
            unit_price: import("@prisma/client-runtime-utils").Decimal;
            tax_rate: import("@prisma/client-runtime-utils").Decimal;
            total: import("@prisma/client-runtime-utils").Decimal;
            returned_quantity: number;
            product_id: string | null;
            invoice_id: string;
        }[];
        customer: {
            name: string;
            id: string;
            phone: string;
            created_at: Date;
            updated_at: Date;
            brand_id: string;
            total_visits: number;
            total_spend: import("@prisma/client-runtime-utils").Decimal;
            loyalty_points: number;
            first_visit_at: Date | null;
            last_visit_at: Date | null;
        } | null;
    } & {
        id: string;
        created_at: Date;
        brand_id: string;
        store_id: string;
        invoice_number: string;
        billing_id: string;
        customer_id: string | null;
        employee_id: string;
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
    }>;
    voidInvoice(id: string, req: any): Promise<{
        message: string;
    }>;
    markShared(id: string): Promise<{
        message: string;
    }>;
    getGeneratePdf(id: string, req: any): Promise<{
        url: string;
    }>;
}
