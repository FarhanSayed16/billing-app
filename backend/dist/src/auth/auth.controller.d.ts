import { AuthService } from './auth.service';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { RegisterStoreAdminDto } from './dto/register-store-admin.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { EmployeeLoginDto } from './dto/employee-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    setup(createSuperAdminDto: CreateSuperAdminDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    register(registerStoreAdminDto: RegisterStoreAdminDto): Promise<{
        message: string;
    }>;
    login(adminLoginDto: AdminLoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
            store: {
                id: string;
                name: string;
            } | null;
        };
    }>;
    employeeLogin(employeeLoginDto: EmployeeLoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            role: "EMPLOYEE";
            store_name: string | undefined;
        };
    }>;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    getMe(req: any): Promise<{
        store: {
            id: string;
            name: string;
            address: string;
            city: string;
        } | null;
        id: string;
        brand_id: string;
        name: string;
        phone: string;
        role: import("@prisma/client").$Enums.Role;
        store_id: string | null;
        email: string | null;
        approval_status: import("@prisma/client").$Enums.ApprovalStatus;
    }>;
    getPendingRegistrations(): Promise<{
        id: string;
        name: string;
        phone: string;
        created_at: Date;
        role: import("@prisma/client").$Enums.Role;
        email: string | null;
    }[]>;
    approveUser(userId: string): Promise<{
        id: string;
        name: string;
        email: string | null;
        approval_status: import("@prisma/client").$Enums.ApprovalStatus;
    }>;
    rejectUser(userId: string): Promise<{
        id: string;
        name: string;
        email: string | null;
        approval_status: import("@prisma/client").$Enums.ApprovalStatus;
    }>;
    suspendUser(userId: string): Promise<{
        id: string;
        name: string;
        is_active: boolean;
        email: string | null;
        approval_status: import("@prisma/client").$Enums.ApprovalStatus;
    }>;
}
