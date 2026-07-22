import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { S3Service } from '../common/s3.service';
export declare class StoresService {
    private prisma;
    private s3Service;
    constructor(prisma: PrismaService, s3Service: S3Service);
    create(createStoreDto: CreateStoreDto, userId: string, brandId: string): Promise<{
        id: string;
        brand_id: string;
        name: string;
        phone: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        address: string;
        city: string;
        state: string;
        gst_number: string | null;
        logo_url: string | null;
        brand_color: string | null;
    }>;
    getPublicStores(): Promise<{
        id: string;
        name: string;
    }[]>;
    findAll(brandId: string): Promise<{
        employee_count: number;
        total_invoices: number;
        today_revenue: number;
        _count: {
            invoices: number;
            users: number;
        };
        id: string;
        brand_id: string;
        name: string;
        phone: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        address: string;
        city: string;
        state: string;
        gst_number: string | null;
        logo_url: string | null;
        brand_color: string | null;
    }[]>;
    findOne(id: string, brandId: string, userStoreId?: string): Promise<{
        employee_count: number;
        total_invoices: number;
        _count: {
            invoices: number;
            users: number;
        };
        id: string;
        brand_id: string;
        name: string;
        phone: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        address: string;
        city: string;
        state: string;
        gst_number: string | null;
        logo_url: string | null;
        brand_color: string | null;
    }>;
    update(id: string, updateStoreDto: UpdateStoreDto, brandId: string, userStoreId?: string): Promise<{
        id: string;
        brand_id: string;
        name: string;
        phone: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        address: string;
        city: string;
        state: string;
        gst_number: string | null;
        logo_url: string | null;
        brand_color: string | null;
    }>;
    setActivation(id: string, brandId: string, isActive: boolean): Promise<{
        id: string;
        brand_id: string;
        name: string;
        phone: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        address: string;
        city: string;
        state: string;
        gst_number: string | null;
        logo_url: string | null;
        brand_color: string | null;
    }>;
    uploadLogo(id: string, brandId: string, userStoreId: string | undefined, file: Express.Multer.File): Promise<{
        id: string;
        brand_id: string;
        name: string;
        phone: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        address: string;
        city: string;
        state: string;
        gst_number: string | null;
        logo_url: string | null;
        brand_color: string | null;
    }>;
}
