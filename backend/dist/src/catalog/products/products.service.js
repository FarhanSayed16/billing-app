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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = exports.UpdateProductDto = exports.CreateProductDto = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const cache_manager_1 = require("@nestjs/cache-manager");
const stream_1 = require("stream");
const csvParser = require('csv-parser');
class CreateProductDto {
    name;
    sku;
    barcode;
    category;
    base_price;
    tax_rate;
    image_url;
}
exports.CreateProductDto = CreateProductDto;
class UpdateProductDto {
    name;
    sku;
    barcode;
    category;
    base_price;
    tax_rate;
    image_url;
}
exports.UpdateProductDto = UpdateProductDto;
let ProductsService = class ProductsService {
    prisma;
    cacheManager;
    constructor(prisma, cacheManager) {
        this.prisma = prisma;
        this.cacheManager = cacheManager;
    }
    async create(brandId, data, userId) {
        return this.prisma.$transaction(async (tx) => {
            const product = await tx.product.create({
                data: { ...data, brand_id: brandId },
            });
            await tx.auditLog.create({
                data: {
                    brand_id: brandId,
                    user_id: userId,
                    action: 'PRODUCT_CREATED',
                    target_type: 'Product',
                    target_id: product.id,
                    metadata: { name: product.name, barcode: product.barcode },
                }
            });
            await this.invalidateCache(brandId);
            return product;
        });
    }
    async findAll(brandId, search, category, page = 1, limit = 20) {
        const cacheKey = `products:${brandId}:${search || ''}:${category || ''}:${page}:${limit}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        const where = { brand_id: brandId, is_active: true };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (category) {
            where.category = category;
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.product.findMany({ where, skip, take: Number(limit), orderBy: { created_at: 'desc' } }),
            this.prisma.product.count({ where }),
        ]);
        const result = { data, total, page, limit, totalPages: Math.ceil(total / limit) };
        await this.cacheManager.set(cacheKey, result, 60000);
        return result;
    }
    async findByBarcode(brandId, barcode) {
        const product = await this.prisma.product.findFirst({
            where: { brand_id: brandId, barcode, is_active: true },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found for this barcode');
        return product;
    }
    async update(id, brandId, data, userId) {
        return this.prisma.$transaction(async (tx) => {
            try {
                const product = await tx.product.updateMany({
                    where: { id, brand_id: brandId },
                    data,
                });
                if (product.count === 0)
                    throw new common_1.NotFoundException('Product not found');
                await tx.auditLog.create({
                    data: {
                        brand_id: brandId,
                        user_id: userId,
                        action: 'PRODUCT_UPDATED',
                        target_type: 'Product',
                        target_id: id,
                        metadata: data,
                    }
                });
                await this.invalidateCache(brandId);
                return { success: true };
            }
            catch (e) {
                if (e instanceof common_1.NotFoundException)
                    throw e;
                throw new common_1.BadRequestException('Update failed');
            }
        });
    }
    async softDelete(id, brandId, userId) {
        await this.update(id, brandId, { is_active: false }, userId);
    }
    async invalidateCache(brandId) {
    }
    async processBulkCsv(brandId, fileBuffer, userId) {
        const productsToCreate = [];
        return new Promise((resolve, reject) => {
            stream_1.Readable.from(fileBuffer)
                .pipe(csvParser())
                .on('data', (row) => {
                if (row.name && row.base_price && row.tax_rate) {
                    productsToCreate.push({
                        brand_id: brandId,
                        name: row.name,
                        sku: row.sku || null,
                        barcode: row.barcode || null,
                        category: row.category || null,
                        base_price: parseFloat(row.base_price),
                        tax_rate: parseFloat(row.tax_rate),
                        image_url: row.image_url || null,
                    });
                }
            })
                .on('end', async () => {
                try {
                    await this.prisma.$transaction(async (tx) => {
                        const res = await tx.product.createMany({
                            data: productsToCreate,
                            skipDuplicates: true,
                        });
                        if (res.count > 0) {
                            await tx.auditLog.create({
                                data: {
                                    brand_id: brandId,
                                    user_id: userId,
                                    action: 'PRODUCT_BULK_UPLOAD',
                                    target_type: 'Product',
                                    target_id: brandId,
                                    metadata: { count: res.count },
                                }
                            });
                        }
                        await this.invalidateCache(brandId);
                        resolve({ createdCount: res.count, totalRowsProcessed: productsToCreate.length });
                    });
                }
                catch (e) {
                    reject(new common_1.BadRequestException('Database bulk insert failed formatting.'));
                }
            })
                .on('error', (err) => {
                reject(new common_1.BadRequestException('Invalid CSV layout'));
            });
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], ProductsService);
//# sourceMappingURL=products.service.js.map