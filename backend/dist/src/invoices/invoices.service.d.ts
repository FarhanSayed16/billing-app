import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PdfService } from './pdf.service';
export declare class InvoicesService {
    private prisma;
    private pdfService;
    constructor(prisma: PrismaService, pdfService: PdfService);
    create(createInvoiceDto: CreateInvoiceDto, storeId: string, employeeId: string, brandId: string): Promise<{
        store: {
            id: string;
            name: string;
            logo_url: string | null;
            gst_number: string | null;
            created_at: Date;
            updated_at: Date;
            phone: string;
            is_active: boolean;
            brand_id: string;
            address: string;
            city: string;
            state: string;
            brand_color: string | null;
        };
        customer: {
            id: string;
            name: string;
            created_at: Date;
            updated_at: Date;
            phone: string;
            brand_id: string;
            total_visits: number;
            total_spend: import("@prisma/client-runtime-utils").Decimal;
            loyalty_points: number;
            first_visit_at: Date | null;
            last_visit_at: Date | null;
        } | null;
        items: {
            id: string;
            name: string;
            total: import("@prisma/client-runtime-utils").Decimal;
            tax_amount: import("@prisma/client-runtime-utils").Decimal;
            product_id: string | null;
            quantity: number;
            unit_price: import("@prisma/client-runtime-utils").Decimal;
            tax_rate: import("@prisma/client-runtime-utils").Decimal;
            invoice_id: string;
        }[];
    } & {
        id: string;
        created_at: Date;
        brand_id: string;
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
    findAll(brandId: string, query: any, role: string, storeId?: string, employeeId?: string): Promise<{
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
    findOne(id: string, role: string, userStoreId?: string, userId?: string): Promise<{
        store: {
            id: string;
            name: string;
            logo_url: string | null;
            gst_number: string | null;
            created_at: Date;
            updated_at: Date;
            phone: string;
            is_active: boolean;
            brand_id: string;
            address: string;
            city: string;
            state: string;
            brand_color: string | null;
        };
        customer: {
            id: string;
            name: string;
            created_at: Date;
            updated_at: Date;
            phone: string;
            brand_id: string;
            total_visits: number;
            total_spend: import("@prisma/client-runtime-utils").Decimal;
            loyalty_points: number;
            first_visit_at: Date | null;
            last_visit_at: Date | null;
        } | null;
        items: {
            id: string;
            name: string;
            total: import("@prisma/client-runtime-utils").Decimal;
            tax_amount: import("@prisma/client-runtime-utils").Decimal;
            product_id: string | null;
            quantity: number;
            unit_price: import("@prisma/client-runtime-utils").Decimal;
            tax_rate: import("@prisma/client-runtime-utils").Decimal;
            invoice_id: string;
        }[];
    } & {
        id: string;
        created_at: Date;
        brand_id: string;
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
    findOneByBillingId(billingId: string): Promise<{
        created_at: Date;
        store: {
            name: string;
            logo_url: string | null;
            gst_number: string | null;
            phone: string;
            address: string;
            city: string;
            brand_color: string | null;
        };
        customer: {
            name: string;
            phone: string;
        } | null;
        items: {
            name: string;
            total: import("@prisma/client-runtime-utils").Decimal;
            tax_amount: import("@prisma/client-runtime-utils").Decimal;
            quantity: number;
            unit_price: import("@prisma/client-runtime-utils").Decimal;
            tax_rate: import("@prisma/client-runtime-utils").Decimal;
        }[];
        invoice_number: string;
        billing_id: string;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        tax_amount: import("@prisma/client-runtime-utils").Decimal;
        discount_amount: import("@prisma/client-runtime-utils").Decimal;
        loyalty_discount: import("@prisma/client-runtime-utils").Decimal;
        grand_total: import("@prisma/client-runtime-utils").Decimal;
        status: import("@prisma/client").$Enums.InvoiceStatus;
    }>;
    findCustomerSummary(phone: string): Promise<{
        invoice_date: Date;
        store_name: string;
        grand_total: import("@prisma/client-runtime-utils").Decimal;
        billing_id: string;
    }[]>;
    voidInvoice(id: string, storeId: string, userId: string): Promise<{
        message: string;
    }>;
    getGeneratePdf(id: string, role: string, userStoreId?: string, userId?: string): Promise<{
        url: string;
    }>;
}
