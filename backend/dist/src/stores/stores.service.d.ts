import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { S3Service } from '../common/s3.service';
export declare class StoresService {
    private prisma;
    private s3Service;
    constructor(prisma: PrismaService, s3Service: S3Service);
    create(createStoreDto: CreateStoreDto, userId: string, brandId: string): Promise<{
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
    }>;
    getPublicStores(): Promise<{
        name: string;
        id: string;
    }[]>;
    findAll(brandId: string): Promise<{
        employee_count: number;
        total_invoices: number;
        today_revenue: number;
        _count: {
            users: number;
            invoices: number;
        };
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
    }[]>;
    findOne(id: string, brandId: string, userStoreId?: string): Promise<{
        employee_count: number;
        total_invoices: number;
        _count: {
            users: number;
            invoices: number;
        };
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
    }>;
    update(id: string, updateStoreDto: UpdateStoreDto, brandId: string, userStoreId?: string): Promise<{
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
    }>;
    setActivation(id: string, brandId: string, isActive: boolean): Promise<{
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
    }>;
    uploadLogo(id: string, brandId: string, userStoreId: string | undefined, file: Express.Multer.File): Promise<{
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
    }>;
}
