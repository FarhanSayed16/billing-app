import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { RegisterStoreAdminDto } from './dto/register-store-admin.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { EmployeeLoginDto } from './dto/employee-login.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    setupSuperAdmin(dto: CreateSuperAdminDto): Promise<{
        access_token: string;
        refresh_token: string;
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
            store: string | null;
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
}
