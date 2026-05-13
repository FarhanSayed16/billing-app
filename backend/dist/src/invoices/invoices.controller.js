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
exports.InvoicesController = void 0;
const common_1 = require("@nestjs/common");
const invoices_service_1 = require("./invoices.service");
const create_invoice_dto_1 = require("./dto/create-invoice.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
let InvoicesController = class InvoicesController {
    invoicesService;
    constructor(invoicesService) {
        this.invoicesService = invoicesService;
    }
    findOnePublic(billingId) {
        return this.invoicesService.findOneByBillingId(billingId);
    }
    findCustomerSummary(phone) {
        return this.invoicesService.findCustomerSummary(phone);
    }
    create(createInvoiceDto, req) {
        return this.invoicesService.create(createInvoiceDto, req.user.storeId, req.user.userId, req.user.brandId);
    }
    findAll(req, query) {
        return this.invoicesService.findAll(req.user.brandId, query, req.user.role, req.user.storeId, req.user.userId);
    }
    findOne(id, req) {
        return this.invoicesService.findOne(id, req.user.role, req.user.storeId, req.user.userId);
    }
    voidInvoice(id, req) {
        return this.invoicesService.voidInvoice(id, req.user.storeId, req.user.userId);
    }
    getGeneratePdf(id, req) {
        return this.invoicesService.getGeneratePdf(id, req.user.role, req.user.storeId, req.user.userId);
    }
};
exports.InvoicesController = InvoicesController;
__decorate([
    (0, common_1.Get)('billing/:billingId'),
    (0, swagger_1.ApiOperation)({ summary: 'PUBLIC: Get full invoice detail by billing ID (no auth)' }),
    __param(0, (0, common_1.Param)('billingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "findOnePublic", null);
__decorate([
    (0, common_1.Get)('customer/:phone'),
    (0, swagger_1.ApiOperation)({ summary: 'PUBLIC: Get summary list of invoices by customer phone (no auth)' }),
    __param(0, (0, common_1.Param)('phone')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "findCustomerSummary", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.EMPLOYEE),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new invoice (Employee only)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_invoice_dto_1.CreateInvoiceDto, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.STORE_ADMIN, client_1.Role.EMPLOYEE),
    (0, swagger_1.ApiOperation)({ summary: 'List invoices based on role and filters' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.STORE_ADMIN, client_1.Role.EMPLOYEE),
    (0, swagger_1.ApiOperation)({ summary: 'Get specific invoice details' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)(':id/void'),
    (0, roles_decorator_1.Roles)(client_1.Role.STORE_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Void an invoice (Store Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "voidInvoice", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)(':id/pdf'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.STORE_ADMIN, client_1.Role.EMPLOYEE),
    (0, swagger_1.ApiOperation)({ summary: 'Get or generate invoice PDF' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "getGeneratePdf", null);
exports.InvoicesController = InvoicesController = __decorate([
    (0, swagger_1.ApiTags)('invoices'),
    (0, common_1.Controller)('invoices'),
    __metadata("design:paramtypes", [invoices_service_1.InvoicesService])
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map