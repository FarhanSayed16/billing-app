export declare class InvoiceItemDto {
    product_id?: string;
    name: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
}
export declare class CreateInvoiceDto {
    customer_id?: string;
    customer_phone?: string;
    customer_name?: string;
    items: InvoiceItemDto[];
    discount_amount?: number;
    loyalty_points_redeemed?: number;
}
