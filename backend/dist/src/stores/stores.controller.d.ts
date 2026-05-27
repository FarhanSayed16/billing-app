import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
export declare class StoresController {
    private readonly storesService;
    constructor(storesService: StoresService);
    getPublicStores(): Promise<{
        name: string;
        id: string;
    }[]>;
    create(createStoreDto: CreateStoreDto, req: any): Promise<{
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
    findAll(req: any): Promise<{
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
    findOne(id: string, req: any): Promise<{
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
    update(id: string, updateStoreDto: UpdateStoreDto, req: any): Promise<{
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
    deactivate(id: string, req: any): Promise<{
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
    activate(id: string, req: any): Promise<{
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
    uploadLogo(id: string, req: any, file: Express.Multer.File): Promise<{
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
