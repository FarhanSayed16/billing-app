export declare class ReturnItemDto {
    invoice_item_id: string;
    quantity: number;
}
export declare class CreateReturnDto {
    billing_id: string;
    items: ReturnItemDto[];
    reason?: string;
}
