import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getStoreInventory(brandId: string, storeId: string) {
    const products = await this.prisma.product.findMany({
      where: { brand_id: brandId, is_active: true }
    });

    const inventory = await this.prisma.storeInventory.findMany({
      where: { store_id: storeId }
    });

    const inventoryMap = new Map(inventory.map(inv => [inv.product_id, inv]));

    return products.map(p => {
      const inv = inventoryMap.get(p.id);
      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        image_url: p.image_url,
        quantity: inv?.quantity || 0,
        low_stock_threshold: inv?.low_stock_threshold || 10,
        status: (inv?.quantity || 0) <= 0 ? 'OUT_OF_STOCK' : ((inv?.quantity || 0) <= (inv?.low_stock_threshold || 10) ? 'LOW_STOCK' : 'OK')
      };
    });
  }

  async adjustStock(storeId: string, productId: string, quantity: number, reason: string, userId: string, brandId: string) {
    // Find or create inventory record
    let inv = await this.prisma.storeInventory.findFirst({
      where: { store_id: storeId, product_id: productId }
    });

    if (inv) {
      inv = await this.prisma.storeInventory.update({
        where: { id: inv.id },
        data: { quantity }
      });
    } else {
      inv = await this.prisma.storeInventory.create({
        data: {
          store_id: storeId,
          product_id: productId,
          quantity: quantity
        }
      });
    }

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        brand_id: brandId,
        user_id: userId,
        action: 'INVENTORY_ADJUSTED',
        target_type: 'StoreInventory',
        target_id: inv.id,
        metadata: { productId, newQuantity: quantity, reason }
      }
    });

    return inv;
  }
}
