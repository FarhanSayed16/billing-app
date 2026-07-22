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
        email: string | null;
        name: string;
        phone: string;
        role: import("@prisma/client").$Enums.Role;
        created_at: Date;
    }[]>;
    approveUser(userId: string): Promise<{
        id: string;
        email: string | null;
        name: string;
        approval_status: import("@prisma/client").$Enums.ApprovalStatus;
    }>;
    rejectUser(userId: string): Promise<{
        id: string;
        email: string | null;
        name: string;
        approval_status: import("@prisma/client").$Enums.ApprovalStatus;
    }>;
    suspendUser(userId: string): Promise<{
        id: string;
        email: string | null;
        name: string;
        approval_status: import("@prisma/client").$Enums.ApprovalStatus;
        is_active: boolean;
    }>;
    getMe(userId: string): Promise<{
        id: string;
        brand_id: string;
        store_id: string | null;
        email: string | null;
        name: string;
        phone: string;
        role: import("@prisma/client").$Enums.Role;
        approval_status: import("@prisma/client").$Enums.ApprovalStatus;
        store: {
            id: string;
            name: string;
            address: string;
            city: string;
        } | null;
    }>;
}
