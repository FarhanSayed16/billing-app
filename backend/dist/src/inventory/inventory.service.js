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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let InventoryService = class InventoryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStoreInventory(brandId, storeId) {
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
    async adjustStock(storeId, productId, quantity, reason, userId, brandId) {
        let inv = await this.prisma.storeInventory.findFirst({
            where: { store_id: storeId, product_id: productId }
        });
        if (inv) {
            inv = await this.prisma.storeInventory.update({
                where: { id: inv.id },
                data: { quantity }
            });
        }
        else {
            inv = await this.prisma.storeInventory.create({
                data: {
                    store_id: storeId,
                    product_id: productId,
                    quantity: quantity
                }
            });
        }
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
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map