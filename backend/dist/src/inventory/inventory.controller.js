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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const inventory_service_1 = require("./inventory.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
let InventoryController = class InventoryController {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    async getInventory(paramStoreId, req) {
        const storeId = paramStoreId === 'mine' ? req.user.storeId : paramStoreId;
        if (req.user.role === client_1.Role.STORE_ADMIN && req.user.storeId !== storeId) {
            throw new common_1.ForbiddenException('You can only view inventory for your assigned store');
        }
        return this.inventoryService.getStoreInventory(req.user.brandId, storeId);
    }
    async adjustStock(paramStoreId, productId, quantity, reason, req) {
        const storeId = paramStoreId === 'mine' ? req.user.storeId : paramStoreId;
        if (req.user.storeId !== storeId) {
            throw new common_1.ForbiddenException('You can only adjust inventory for your assigned store');
        }
        return this.inventoryService.adjustStock(storeId, productId, quantity, reason, req.user.userId, req.user.brandId);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.STORE_ADMIN),
    (0, common_1.Get)(':storeId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get store inventory' }),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getInventory", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.STORE_ADMIN),
    (0, common_1.Patch)(':storeId/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Adjust stock quantity' }),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Param)('productId')),
    __param(2, (0, common_1.Body)('quantity')),
    __param(3, (0, common_1.Body)('reason')),
    __param(4, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "adjustStock", null);
exports.InventoryController = InventoryController = __decorate([
    (0, swagger_1.ApiTags)('inventory'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('inventory'),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map