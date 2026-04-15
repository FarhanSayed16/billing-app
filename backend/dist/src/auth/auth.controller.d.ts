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
            store: string | null;
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
    getPendingRegistrations(): Promise<{
        id: string;
        name: string;
        created_at: Date;
        email: string | null;
        phone: string;
    }[]>;
    approveUser(userId: string): Promise<{
        id: string;
        name: string;
        created_at: Date;
        updated_at: Date;
        email: string | null;
        password_hash: string | null;
        phone: string;
        pin: string | null;
        role: import("@prisma/client").$Enums.Role;
        approval_status: import("@prisma/client").$Enums.ApprovalStatus;
        is_active: boolean;
        last_login_at: Date | null;
        brand_id: string;
        store_id: string | null;
    }>;
    rejectUser(userId: string): Promise<{
        id: string;
        name: string;
        created_at: Date;
        updated_at: Date;
        email: string | null;
        password_hash: string | null;
        phone: string;
        pin: string | null;
        role: import("@prisma/client").$Enums.Role;
        approval_status: import("@prisma/client").$Enums.ApprovalStatus;
        is_active: boolean;
        last_login_at: Date | null;
        brand_id: string;
        store_id: string | null;
    }>;
    suspendUser(userId: string): Promise<{
        id: string;
        name: string;
        created_at: Date;
        updated_at: Date;
        email: string | null;
        password_hash: string | null;
        phone: string;
        pin: string | null;
        role: import("@prisma/client").$Enums.Role;
        approval_status: import("@prisma/client").$Enums.ApprovalStatus;
        is_active: boolean;
        last_login_at: Date | null;
        brand_id: string;
        store_id: string | null;
    }>;
}
