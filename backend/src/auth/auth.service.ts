import { Injectable, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { RegisterStoreAdminDto } from './dto/register-store-admin.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { EmployeeLoginDto } from './dto/employee-login.dto';
import { Role, ApprovalStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async setupSuperAdmin(dto: CreateSuperAdminDto) {
    const existingSuperAdmin = await this.prisma.user.findFirst({
      where: { role: Role.SUPER_ADMIN },
    });

    if (existingSuperAdmin) {
      throw new ForbiddenException('Super Admin already exists.');
    }

    const { name, email, password, phone, brand_name, brand_gst } = dto;

    const brand = await this.prisma.brand.create({
      data: {
        name: brand_name,
        gst_number: brand_gst,
      },
    });

    const password_hash = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        brand_id: brand.id,
        name,
        email,
        phone,
        password_hash,
        role: Role.SUPER_ADMIN,
        approval_status: ApprovalStatus.APPROVED,
      },
    });

    const payload = { userId: user.id, role: user.role, brandId: user.brand_id };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async registerStoreAdmin(dto: RegisterStoreAdminDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered.');
    }

    const superAdmin = await this.prisma.user.findFirst({
      where: { role: Role.SUPER_ADMIN },
    });

    if (!superAdmin) {
      throw new BadRequestException('System is not set up properly.');
    }

    const password_hash = await bcrypt.hash(dto.password, 12);

    await this.prisma.user.create({
      data: {
        brand_id: superAdmin.brand_id, // Store Admin belongs to the overarching Brand
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        password_hash,
        role: Role.STORE_ADMIN,
        approval_status: ApprovalStatus.PENDING,
      },
    });

    return { message: 'Registration successful. Awaiting Super Admin approval.' };
  }

  async adminLogin(dto: AdminLoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password_hash) {
      throw new ForbiddenException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password_hash);
    if (!isMatch) {
      throw new ForbiddenException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new ForbiddenException('User is inactive');
    }

    if (user.approval_status === ApprovalStatus.PENDING) {
      throw new ForbiddenException('Your account is pending approval');
    }
    if (user.approval_status === ApprovalStatus.REJECTED) {
      throw new ForbiddenException('Your registration was rejected');
    }
    if (user.approval_status === ApprovalStatus.SUSPENDED) {
      throw new ForbiddenException('Your account has been suspended');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    const payload = { userId: user.id, role: user.role, brandId: user.brand_id, storeId: user.store_id };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        store: user.store_id,
      },
    };
  }

  async employeeLogin(dto: EmployeeLoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: dto.employee_id,
        store_id: dto.store_id,
      },
      include: {
        store: true,
      }
    });

    if (!user || user.role !== Role.EMPLOYEE || !user.pin) {
      throw new ForbiddenException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new ForbiddenException('User is inactive');
    }

    const isMatch = await bcrypt.compare(dto.pin, user.pin);
    if (!isMatch) {
      throw new ForbiddenException('Invalid PIN');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    const payload = { userId: user.id, role: user.role, storeId: user.store_id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        store_name: user.store?.name,
      },
    };
  }
}
