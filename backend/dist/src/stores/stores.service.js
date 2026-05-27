"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoresService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const s3_service_1 = require("../common/s3.service");
let StoresService = class StoresService {
    prisma;
    s3Service;
    constructor(prisma, s3Service) {
        this.prisma = prisma;
        this.s3Service = s3Service;
    }
    async create(createStoreDto, userId, brandId) {
        const store = await this.prisma.store.create({
            data: {
                ...createStoreDto,
                brand_id: brandId,
            },
        });
        await this.prisma.user.update({
            where: { id: userId },
            data: { store_id: store.id },
        });
        return store;
    }
    async getPublicStores() {
        return this.prisma.store.findMany({
            where: { is_active: true },
            select: {
                id: true,
                name: true,
            },
            orderBy: { name: 'asc' },
        });
    }
    async findAll(brandId) {
        const stores = await this.prisma.store.findMany({
            where: { brand_id: brandId },
            include: {
                _count: {
                    select: { users: true, invoices: true },
                },
            },
        });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const storeIds = stores.map(s => s.id);
        const revenueStats = await this.prisma.invoice.groupBy({
            by: ['store_id'],
            where: {
                store_id: { in: storeIds },
                created_at: { gte: today },
                status: { not: 'FULLY_REFUNDED' }
            },
            _sum: {
                grand_total: true
            }
        });
        const revMap = new Map(revenueStats.map(r => [r.store_id, Number(r._sum.grand_total || 0)]));
        return stores.map(store => ({
            ...store,
            employee_count: store._count.users,
            total_invoices: store._count.invoices,
            today_revenue: revMap.get(store.id) || 0,
        }));
    }
    async findOne(id, brandId, userStoreId) {
        if (userStoreId && userStoreId !== id) {
            throw new common_1.ForbiddenException('You can only access your own store.');
        }
        const store = await this.prisma.store.findFirst({
            where: { id, brand_id: brandId },
            include: {
                _count: {
                    select: { users: true, invoices: true },
                },
            },
        });
        if (!store)
            throw new common_1.NotFoundException('Store not found');
        return {
            ...store,
            employee_count: store._count.users,
            total_invoices: store._count.invoices,
        };
    }
    async update(id, updateStoreDto, brandId, userStoreId) {
        if (userStoreId && userStoreId !== id) {
            throw new common_1.ForbiddenException('You can only modify your own store.');
        }
        return this.prisma.store.update({
            where: { id, brand_id: brandId },
            data: updateStoreDto,
        });
    }
    async setActivation(id, brandId, isActive) {
        return this.prisma.store.update({
            where: { id, brand_id: brandId },
            data: { is_active: isActive },
        });
    }
    async uploadLogo(id, brandId, userStoreId, file) {
        if (userStoreId && userStoreId !== id) {
            throw new common_1.ForbiddenException('You can only upload logos for your own store.');
        }
        const store = await this.prisma.store.findFirst({ where: { id, brand_id: brandId } });
        if (!store)
            throw new common_1.NotFoundException('Store not found');
        const ext = file.originalname.split('.').pop();
        const key = `logos/${id}/logo.${ext}`;
        const logoUrl = await this.s3Service.uploadFile(file, key);
        return this.prisma.store.update({
            where: { id },
            data: { logo_url: logoUrl },
        });
    }
};
exports.StoresService = StoresService;
exports.StoresService = StoresService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        s3_service_1.S3Service])
], StoresService);
//# sourceMappingURL=stores.service.js.map