import { ProductsService, CreateProductDto, UpdateProductDto } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto, req: any): Promise<{
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
    findAll(req: any, search?: string, category?: string, page?: string, limit?: string): Promise<{}>;
    findByBarcode(barcode: string, req: any): Promise<{
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
    update(id: string, updateProductDto: UpdateProductDto, req: any): Promise<{
        success: boolean;
    }>;
    remove(id: string, req: any): Promise<void>;
    uploadImage(id: string, file: Express.Multer.File, req: any): Promise<{
        url: string;
    }>;
    bulkUpload(file: Express.Multer.File, req: any): Promise<unknown>;
}
