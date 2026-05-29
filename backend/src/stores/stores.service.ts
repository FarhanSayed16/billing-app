import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { S3Service } from '../common/s3.service';

@Injectable()
export class StoresService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  async create(createStoreDto: CreateStoreDto, userId: string, brandId: string) {
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

  async findAll(brandId: string) {
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

  async findOne(id: string, brandId: string, userStoreId?: string) {
    if (userStoreId && userStoreId !== id) {
      throw new ForbiddenException('You can only access your own store.');
    }

    const store = await this.prisma.store.findFirst({
      where: { id, brand_id: brandId },
      include: {
        _count: {
          select: { users: true, invoices: true },
        },
      },
    });

    if (!store) throw new NotFoundException('Store not found');

    return {
      ...store,
      employee_count: store._count.users,
      total_invoices: store._count.invoices,
    };
  }

  async update(id: string, updateStoreDto: UpdateStoreDto, brandId: string, userStoreId?: string) {
    if (userStoreId && userStoreId !== id) {
      throw new ForbiddenException('You can only modify your own store.');
    }
    return this.prisma.store.update({
      where: { id, brand_id: brandId },
      data: updateStoreDto,
    });
  }

  async setActivation(id: string, brandId: string, isActive: boolean) {
    return this.prisma.store.update({
      where: { id, brand_id: brandId },
      data: { is_active: isActive },
    });
  }

  async uploadLogo(id: string, brandId: string, userStoreId: string | undefined, file: Express.Multer.File) {
    if (userStoreId && userStoreId !== id) {
      throw new ForbiddenException('You can only upload logos for your own store.');
    }
    
    const store = await this.prisma.store.findFirst({ where: { id, brand_id: brandId } });
    if (!store) throw new NotFoundException('Store not found');

    const ext = file.originalname.split('.').pop();
    const key = `logos/${id}/logo.${ext}`;
    const logoUrl = await this.s3Service.uploadFile(file, key);

    return this.prisma.store.update({
      where: { id },
      data: { logo_url: logoUrl },
    });
  }
}
