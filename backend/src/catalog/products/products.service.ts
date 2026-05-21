import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Readable } from 'stream';
const csvParser = require('csv-parser');

export class CreateProductDto {
  name: string;
  sku?: string;
  barcode?: string;
  category?: string;
  base_price: number;
  tax_rate: number;
  image_url?: string;
}

export class UpdateProductDto {
  name?: string;
  sku?: string;
  barcode?: string;
  category?: string;
  base_price?: number;
  tax_rate?: number;
  image_url?: string;
}

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(brandId: string, data: CreateProductDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        // @ts-ignore - Decimal mapping
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

  async findAll(brandId: string, search?: string, category?: string, page = 1, limit = 20) {
    const cacheKey = `products:${brandId}:${search || ''}:${category || ''}:${page}:${limit}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const where: any = { brand_id: brandId, is_active: true };
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
    await this.cacheManager.set(cacheKey, result, 60000); // Cache for 1 min
    return result;
  }

  async findByBarcode(brandId: string, barcode: string) {
    const product = await this.prisma.product.findFirst({
      where: { brand_id: brandId, barcode, is_active: true },
    });
    if (!product) throw new NotFoundException('Product not found for this barcode');
    return product;
  }

  async update(id: string, brandId: string, data: UpdateProductDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      try {
        const product = await tx.product.updateMany({
          where: { id, brand_id: brandId },
          data,
        });
        if (product.count === 0) throw new NotFoundException('Product not found');
        
        await tx.auditLog.create({
          data: {
             brand_id: brandId,
             user_id: userId,
             action: 'PRODUCT_UPDATED',
             target_type: 'Product',
             target_id: id,
             metadata: data as any,
          }
        });

        await this.invalidateCache(brandId);
        return { success: true };
      } catch (e) {
        if (e instanceof NotFoundException) throw e;
        throw new BadRequestException('Update failed');
      }
    });
  }

  async softDelete(id: string, brandId: string, userId: string) {
    await this.update(id, brandId, { is_active: false } as any, userId);
  }

  async invalidateCache(brandId: string) {
    // A complex regex invalidation would go here. For now we will rely on TTL.
    // In production we would use Redis keys scanning to delete `products:${brandId}:*`.
  }

  async processBulkCsv(brandId: string, fileBuffer: Buffer, userId: string) {
    const productsToCreate: any[] = [];
    return new Promise((resolve, reject) => {
      Readable.from(fileBuffer)
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
          } catch (e) {
            reject(new BadRequestException('Database bulk insert failed formatting.'));
          }
        })
        .on('error', (err) => {
          reject(new BadRequestException('Invalid CSV layout'));
        });
    });
  }
}
