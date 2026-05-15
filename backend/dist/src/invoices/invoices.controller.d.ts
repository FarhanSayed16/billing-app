import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    findOnePublic(billingId: string): Promise<{
        store: {
            name: string;
            address: string;
            city: string;
            gst_number: string | null;
            phone: string;
            logo_url: string | null;
            brand_color: string | null;
        };
        created_at: Date;
        customer: {
            name: string;
            phone: string;
        } | null;
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
            total: import("@prisma/client-runtime-utils").Decimal;
            quantity: number;
            unit_price: import("@prisma/client-runtime-utils").Decimal;
            tax_rate: import("@prisma/client-runtime-utils").Decimal;
        }[];
    }>;
    findCustomerSummary(phone: string): Promise<{
        invoice_date: Date;
        store_name: string;
        grand_total: import("@prisma/client-runtime-utils").Decimal;
        billing_id: string;
    }[]>;
    create(createInvoiceDto: CreateInvoiceDto, req: any): Promise<{
        store: {
            id: string;
            brand_id: string;
            name: string;
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
        };
        customer: {
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
        } | null;
        items: {
            id: string;
            name: string;
            tax_amount: import("@prisma/client-runtime-utils").Decimal;
            total: import("@prisma/client-runtime-utils").Decimal;
            product_id: string | null;
            quantity: number;
            unit_price: import("@prisma/client-runtime-utils").Decimal;
            tax_rate: import("@prisma/client-runtime-utils").Decimal;
            returned_quantity: number;
            invoice_id: string;
        }[];
    } & {
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
            id: string;
            brand_id: string;
            name: string;
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
        };
        customer: {
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
        } | null;
        items: {
            id: string;
            name: string;
            tax_amount: import("@prisma/client-runtime-utils").Decimal;
            total: import("@prisma/client-runtime-utils").Decimal;
            product_id: string | null;
            quantity: number;
            unit_price: import("@prisma/client-runtime-utils").Decimal;
            tax_rate: import("@prisma/client-runtime-utils").Decimal;
            returned_quantity: number;
            invoice_id: string;
        }[];
    } & {
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
    }>;
    voidInvoice(id: string, req: any): Promise<{
        message: string;
    }>;
    getGeneratePdf(id: string, req: any): Promise<{
        url: string;
    }>;
}
