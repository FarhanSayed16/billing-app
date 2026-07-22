import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
export declare class StoresController {
    private readonly storesService;
    constructor(storesService: StoresService);
    getPublicStores(): Promise<{
        id: string;
        name: string;
    }[]>;
    create(createStoreDto: CreateStoreDto, req: any): Promise<{
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
    findAll(req: any): Promise<{
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
    findOne(id: string, req: any): Promise<{
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
    update(id: string, updateStoreDto: UpdateStoreDto, req: any): Promise<{
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
    deactivate(id: string, req: any): Promise<{
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
    activate(id: string, req: any): Promise<{
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
    uploadLogo(id: string, req: any, file: Express.Multer.File): Promise<{
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
