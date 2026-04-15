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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const ioredis_1 = require("ioredis");
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    prisma;
    jwtService;
    redis;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.redis = new ioredis_1.Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    }
    async setupSuperAdmin(dto) {
        const existingSuperAdmin = await this.prisma.user.findFirst({
            where: { role: client_1.Role.SUPER_ADMIN },
        });
        if (existingSuperAdmin) {
            throw new common_1.ForbiddenException('Super Admin already exists.');
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
                role: client_1.Role.SUPER_ADMIN,
                approval_status: client_1.ApprovalStatus.APPROVED,
            },
        });
        const payload = { userId: user.id, role: user.role, brandId: user.brand_id };
        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
        };
    }
    async registerStoreAdmin(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email is already registered.');
        }
        const superAdmin = await this.prisma.user.findFirst({
            where: { role: client_1.Role.SUPER_ADMIN },
        });
        if (!superAdmin) {
            throw new common_1.BadRequestException('System is not set up properly.');
        }
        const password_hash = await bcrypt.hash(dto.password, 12);
        await this.prisma.user.create({
            data: {
                brand_id: superAdmin.brand_id,
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                password_hash,
                role: client_1.Role.STORE_ADMIN,
                approval_status: client_1.ApprovalStatus.PENDING,
            },
        });
        return { message: 'Registration successful. Awaiting Super Admin approval.' };
    }
    async adminLogin(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user || !user.password_hash) {
            throw new common_1.ForbiddenException('Invalid credentials');
        }
        const isMatch = await bcrypt.compare(dto.password, user.password_hash);
        if (!isMatch) {
            throw new common_1.ForbiddenException('Invalid credentials');
        }
        if (!user.is_active) {
            throw new common_1.ForbiddenException('User is inactive');
        }
        if (user.approval_status === client_1.ApprovalStatus.PENDING) {
            throw new common_1.ForbiddenException('Your account is pending approval');
        }
        if (user.approval_status === client_1.ApprovalStatus.REJECTED) {
            throw new common_1.ForbiddenException('Your registration was rejected');
        }
        if (user.approval_status === client_1.ApprovalStatus.SUSPENDED) {
            throw new common_1.ForbiddenException('Your account has been suspended');
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
    async employeeLogin(dto) {
        const user = await this.prisma.user.findFirst({
            where: {
                id: dto.employee_id,
                store_id: dto.store_id,
            },
            include: {
                store: true,
            }
        });
        if (!user || user.role !== client_1.Role.EMPLOYEE || !user.pin) {
            throw new common_1.ForbiddenException('Invalid credentials');
        }
        if (!user.is_active) {
            throw new common_1.ForbiddenException('User is inactive');
        }
        const isMatch = await bcrypt.compare(dto.pin, user.pin);
        if (!isMatch) {
            throw new common_1.ForbiddenException('Invalid PIN');
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
    async refreshToken(dto) {
        const isBlacklisted = await this.redis.get(`bl_rt_${dto.refresh_token}`);
        if (isBlacklisted)
            throw new common_1.UnauthorizedException('Token has been invalidated');
        try {
            const payload = this.jwtService.verify(dto.refresh_token);
            await this.redis.set(`bl_rt_${dto.refresh_token}`, '1', 'EX', 7 * 24 * 60 * 60);
            const newPayload = { userId: payload.userId, role: payload.role, brandId: payload.brandId, storeId: payload.storeId };
            return {
                access_token: this.jwtService.sign(newPayload),
                refresh_token: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
            };
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async getPendingRegistrations() {
        return this.prisma.user.findMany({
            where: { approval_status: client_1.ApprovalStatus.PENDING },
            select: { id: true, name: true, email: true, phone: true, created_at: true },
        });
    }
    async approveUser(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { approval_status: client_1.ApprovalStatus.APPROVED },
        });
    }
    async rejectUser(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { approval_status: client_1.ApprovalStatus.REJECTED },
        });
    }
    async suspendUser(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { approval_status: client_1.ApprovalStatus.SUSPENDED, is_active: false },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map