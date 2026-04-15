import { AuthService } from './auth.service';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { RegisterStoreAdminDto } from './dto/register-store-admin.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { EmployeeLoginDto } from './dto/employee-login.dto';
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
}
