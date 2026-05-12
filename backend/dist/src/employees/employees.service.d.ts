import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ResetPinDto } from './dto/reset-pin.dto';
export declare class EmployeesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createEmployeeDto: CreateEmployeeDto, brandId: string, storeId: string): Promise<{
        id: string;
        name: string;
    }>;
    findAll(brandId: string, storeId: string): Promise<{
        id: string;
        name: string;
        phone: string;
        is_active: boolean;
        last_login_at: Date | null;
        bills_today_count: number;
    }[]>;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto, brandId: string, storeId: string): Promise<{
        id: string;
        name: string;
        phone: string;
        is_active: boolean;
    }>;
    resetPin(id: string, resetPinDto: ResetPinDto, brandId: string, storeId: string): Promise<{
        message: string;
    }>;
    remove(id: string, brandId: string, storeId: string): Promise<{
        message: string;
    }>;
    getLoginList(storeId: string): Promise<{
        id: string;
        name: string;
    }[]>;
}
