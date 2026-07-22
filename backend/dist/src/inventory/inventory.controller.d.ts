import { InventoryService } from './inventory.service';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    getInventory(paramStoreId: string, req: any): Promise<{
        id: string;
        name: string;
        sku: string | null;
        category: string | null;
        image_url: string | null;
        quantity: number;
        low_stock_threshold: number;
        status: string;
    }[]>;
    adjustStock(paramStoreId: string, productId: string, quantity: number, reason: string, req: any): Promise<{
        id: string;
        store_id: string;
        updated_at: Date;
        product_id: string;
        quantity: number;
        low_stock_threshold: number;
    }>;
}
