"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
let EmployeesService = class EmployeesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createEmployeeDto, brandId, storeId) {
        const existingUser = await this.prisma.user.findFirst({
            where: { phone: createEmployeeDto.phone, brand_id: brandId },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this phone number already exists in this brand.');
        }
        const pin_hash = await bcrypt.hash(createEmployeeDto.pin, 12);
        const employee = await this.prisma.user.create({
            data: {
                brand_id: brandId,
                store_id: storeId,
                name: createEmployeeDto.name,
                phone: createEmployeeDto.phone,
                pin: pin_hash,
                role: client_1.Role.EMPLOYEE,
                approval_status: client_1.ApprovalStatus.APPROVED,
            },
        });
        return { id: employee.id, name: employee.name };
    }
    async findAll(brandId, storeId) {
        const employees = await this.prisma.user.findMany({
            where: { brand_id: brandId, store_id: storeId, role: client_1.Role.EMPLOYEE },
            select: {
                id: true,
                name: true,
                phone: true,
                is_active: true,
                last_login_at: true,
                _count: {
                    select: { invoices: true },
                },
            },
        });
        return employees.map(emp => ({
            ...emp,
            bills_today_count: emp._count.invoices,
        }));
    }
    async update(id, updateEmployeeDto, brandId, storeId) {
        const employee = await this.prisma.user.findFirst({
            where: { id, brand_id: brandId, store_id: storeId, role: client_1.Role.EMPLOYEE },
        });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found or unauthorized.');
        return this.prisma.user.update({
            where: { id },
            data: updateEmployeeDto,
            select: { id: true, name: true, phone: true, is_active: true },
        });
    }
    async resetPin(id, resetPinDto, brandId, storeId) {
        const employee = await this.prisma.user.findFirst({
            where: { id, brand_id: brandId, store_id: storeId, role: client_1.Role.EMPLOYEE },
        });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found or unauthorized.');
        const pin_hash = await bcrypt.hash(resetPinDto.pin, 12);
        await this.prisma.user.update({
            where: { id },
            data: { pin: pin_hash },
        });
        return { message: 'PIN reset successfully.' };
    }
    async remove(id, brandId, storeId) {
        const employee = await this.prisma.user.findFirst({
            where: { id, brand_id: brandId, store_id: storeId, role: client_1.Role.EMPLOYEE },
        });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found or unauthorized.');
        await this.prisma.user.update({
            where: { id },
            data: { is_active: false },
        });
        return { message: 'Employee deactivated successfully.' };
    }
    async getLoginList(storeId) {
        return this.prisma.user.findMany({
            where: { store_id: storeId, role: client_1.Role.EMPLOYEE, is_active: true },
            select: { id: true, name: true },
        });
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map