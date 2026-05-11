import { PrismaService } from '../../prisma/prisma.service';
import type { Cache } from 'cache-manager';
export declare class CreateProductDto {
    name: string;
    sku?: string;
    barcode?: string;
    category?: string;
    base_price: number;
    tax_rate: number;
    image_url?: string;
}
export declare class UpdateProductDto {
    name?: string;
    sku?: string;
    barcode?: string;
    category?: string;
    base_price?: number;
    tax_rate?: number;
    image_url?: string;
}
export declare class ProductsService {
    private readonly prisma;
    private cacheManager;
    constructor(prisma: PrismaService, cacheManager: Cache);
    create(brandId: string, data: CreateProductDto, userId: string): Promise<{
        id: string;
        brand_id: string;
        name: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        tax_rate: import("@prisma/client-runtime-utils").Decimal;
        sku: string | null;
        barcode: string | null;
        category: string | null;
        base_price: import("@prisma/client-runtime-utils").Decimal;
        image_url: string | null;
    }>;
    findAll(brandId: string, search?: string, category?: string, page?: number, limit?: number): Promise<{}>;
    findByBarcode(brandId: string, barcode: string): Promise<{
        id: string;
        brand_id: string;
        name: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        tax_rate: import("@prisma/client-runtime-utils").Decimal;
        sku: string | null;
        barcode: string | null;
        category: string | null;
        base_price: import("@prisma/client-runtime-utils").Decimal;
        image_url: string | null;
    }>;
    update(id: string, brandId: string, data: UpdateProductDto, userId: string): Promise<{
        success: boolean;
    }>;
    softDelete(id: string, brandId: string, userId: string): Promise<void>;
    invalidateCache(brandId: string): Promise<void>;
    processBulkCsv(brandId: string, fileBuffer: Buffer, userId: string): Promise<unknown>;
}
