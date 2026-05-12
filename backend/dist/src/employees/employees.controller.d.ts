import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ResetPinDto } from './dto/reset-pin.dto';
export declare class EmployeesController {
    private readonly employeesService;
    constructor(employeesService: EmployeesService);
    getLoginList(storeId: string): Promise<{
        id: string;
        name: string;
    }[]>;
    create(createEmployeeDto: CreateEmployeeDto, req: any): Promise<{
        id: string;
        name: string;
    }>;
    findAll(req: any, queryStoreId?: string): Promise<{
        id: string;
        name: string;
        phone: string;
        is_active: boolean;
        last_login_at: Date | null;
        bills_today_count: number;
    }[]>;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto, req: any): Promise<{
        id: string;
        name: string;
        phone: string;
        is_active: boolean;
    }>;
    resetPin(id: string, resetPinDto: ResetPinDto, req: any): Promise<{
        message: string;
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
