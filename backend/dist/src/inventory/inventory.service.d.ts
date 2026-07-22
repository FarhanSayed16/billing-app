import { PrismaService } from '../prisma/prisma.service';
export declare class InventoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getStoreInventory(brandId: string, storeId: string): Promise<{
        id: string;
        name: string;
        sku: string | null;
        category: string | null;
        image_url: string | null;
        quantity: number;
        low_stock_threshold: number;
        status: string;
    }[]>;
    adjustStock(storeId: string, productId: string, quantity: number, reason: string, userId: string, brandId: string): Promise<{
        id: string;
        store_id: string;
        updated_at: Date;
        product_id: string;
        quantity: number;
        low_stock_threshold: number;
    }>;
}
