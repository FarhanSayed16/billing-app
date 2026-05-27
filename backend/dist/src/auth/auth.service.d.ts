import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { RegisterStoreAdminDto } from './dto/register-store-admin.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { EmployeeLoginDto } from './dto/employee-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private redis;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    private signRefreshToken;
    setupSuperAdmin(dto: CreateSuperAdminDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    registerStoreAdmin(dto: RegisterStoreAdminDto): Promise<{
        message: string;
    }>;
    adminLogin(dto: AdminLoginDto): Promise<{
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
    employeeLogin(dto: EmployeeLoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            role: "EMPLOYEE";
            store_name: string | undefined;
        };
    }>;
    refreshToken(dto: RefreshTokenDto): Promise<{
        access_token: string;
        refresh_token: string;
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
    getMe(userId: string): Promise<{
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
}
