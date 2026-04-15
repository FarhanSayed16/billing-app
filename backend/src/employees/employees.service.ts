import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ResetPinDto } from './dto/reset-pin.dto';
import * as bcrypt from 'bcrypt';
import { Role, ApprovalStatus } from '@prisma/client';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto, brandId: string, storeId: string) {
    const existingUser = await this.prisma.user.findFirst({
      where: { phone: createEmployeeDto.phone, brand_id: brandId, role: Role.EMPLOYEE },
    });

    if (existingUser) {
      throw new ConflictException('An employee with this phone number already exists in this brand.');
    }

    const pin_hash = await bcrypt.hash(createEmployeeDto.pin, 12);

    const employee = await this.prisma.user.create({
      data: {
        brand_id: brandId,
        store_id: storeId,
        name: createEmployeeDto.name,
        phone: createEmployeeDto.phone,
        pin: pin_hash,
        role: Role.EMPLOYEE,
        approval_status: ApprovalStatus.APPROVED,
      },
    });

    return { id: employee.id, name: employee.name };
  }

  async findAll(brandId: string, storeId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const employees = await this.prisma.user.findMany({
      where: { brand_id: brandId, store_id: storeId, role: Role.EMPLOYEE },
      select: {
        id: true,
        name: true,
        phone: true,
        is_active: true,
        last_login_at: true,
        _count: {
          select: {
            invoices: {
              where: { created_at: { gte: todayStart } },
            },
          },
        },
      },
    });

    return employees.map(emp => ({
      id: emp.id,
      name: emp.name,
      phone: emp.phone,
      is_active: emp.is_active,
      last_login_at: emp.last_login_at,
      bills_today_count: emp._count.invoices,
    }));
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto, brandId: string, storeId: string) {
    const employee = await this.prisma.user.findFirst({
      where: { id, brand_id: brandId, store_id: storeId, role: Role.EMPLOYEE },
    });
    if (!employee) throw new NotFoundException('Employee not found or unauthorized.');

    return this.prisma.user.update({
      where: { id },
      data: updateEmployeeDto,
      select: { id: true, name: true, phone: true, is_active: true },
    });
  }

  async resetPin(id: string, resetPinDto: ResetPinDto, brandId: string, storeId: string) {
    const employee = await this.prisma.user.findFirst({
      where: { id, brand_id: brandId, store_id: storeId, role: Role.EMPLOYEE },
    });
    if (!employee) throw new NotFoundException('Employee not found or unauthorized.');

    const pin_hash = await bcrypt.hash(resetPinDto.pin, 12);
    await this.prisma.user.update({
      where: { id },
      data: { pin: pin_hash },
    });
    return { message: 'PIN reset successfully.' };
  }

  async remove(id: string, brandId: string, storeId: string) {
    const employee = await this.prisma.user.findFirst({
      where: { id, brand_id: brandId, store_id: storeId, role: Role.EMPLOYEE },
    });
    if (!employee) throw new NotFoundException('Employee not found or unauthorized.');

    await this.prisma.user.update({
      where: { id },
      data: { is_active: false },
    });
    return { message: 'Employee deactivated successfully.' };
  }

  async getLoginList(storeId: string) {
    return this.prisma.user.findMany({
      where: { store_id: storeId, role: Role.EMPLOYEE, is_active: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }
}
