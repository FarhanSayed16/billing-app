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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("./analytics.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
let AnalyticsController = class AnalyticsController {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async getGlobalAnalytics(req) {
        return this.analyticsService.getGlobalAnalytics(req.user.brandId);
    }
    async getStoreAnalytics(paramStoreId, req) {
        const storeId = paramStoreId === 'mine' ? req.user.storeId : paramStoreId;
        if (req.user.role === client_1.Role.STORE_ADMIN && req.user.storeId !== storeId) {
            throw new common_1.ForbiddenException('You can only view analytics for your assigned store');
        }
        return this.analyticsService.getStoreAnalytics(req.user.brandId, storeId);
    }
    async getRevenueChart(storeId, req) {
        return this.analyticsService.getRevenueChart(req.user.brandId, storeId);
    }
    async exportRevenue(req, startDate, endDate, res) {
        const csvData = await this.analyticsService.exportRevenue(req.user.brandId, startDate, endDate);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=revenue-${timestamp}.csv`);
        return res.status(200).send(csvData);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    (0, common_1.Get)('global'),
    (0, swagger_1.ApiOperation)({ summary: 'Get global analytics for Super Admin' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getGlobalAnalytics", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.STORE_ADMIN),
    (0, common_1.Get)('store/:storeId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get analytics for a specific store' }),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getStoreAnalytics", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    (0, common_1.Get)('revenue-chart'),
    (0, swagger_1.ApiOperation)({ summary: 'Get charting revenue data' }),
    __param(0, (0, common_1.Query)('store_id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getRevenueChart", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    (0, common_1.Get)('export/revenue'),
    (0, swagger_1.ApiOperation)({ summary: 'Export revenue as CSV' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "exportRevenue", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('analytics'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map