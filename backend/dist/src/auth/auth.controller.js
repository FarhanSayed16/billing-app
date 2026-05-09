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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const create_super_admin_dto_1 = require("./dto/create-super-admin.dto");
const register_store_admin_dto_1 = require("./dto/register-store-admin.dto");
const admin_login_dto_1 = require("./dto/admin-login.dto");
const employee_login_dto_1 = require("./dto/employee-login.dto");
const refresh_token_dto_1 = require("./dto/refresh-token.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const roles_guard_1 = require("./guards/roles.guard");
const roles_decorator_1 = require("./decorators/roles.decorator");
const client_1 = require("@prisma/client");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    setup(createSuperAdminDto) {
        return this.authService.setupSuperAdmin(createSuperAdminDto);
    }
    register(registerStoreAdminDto) {
        return this.authService.registerStoreAdmin(registerStoreAdminDto);
    }
    login(adminLoginDto) {
        return this.authService.adminLogin(adminLoginDto);
    }
    employeeLogin(employeeLoginDto) {
        return this.authService.employeeLogin(employeeLoginDto);
    }
    refresh(refreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto);
    }
    getPendingRegistrations() {
        return this.authService.getPendingRegistrations();
    }
    approveUser(userId) {
        return this.authService.approveUser(userId);
    }
    rejectUser(userId) {
        return this.authService.rejectUser(userId);
    }
    suspendUser(userId) {
        return this.authService.suspendUser(userId);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('setup'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin Registration (First-Time Setup)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_super_admin_dto_1.CreateSuperAdminDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "setup", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Store Admin Self-Registration' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_store_admin_dto_1.RegisterStoreAdminDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin Login (Super Admin & Store Admin)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_login_dto_1.AdminLoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('employee-login'),
    (0, swagger_1.ApiOperation)({ summary: 'Employee Login via PIN' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employee_login_dto_1.EmployeeLoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "employeeLogin", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh Access Token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_token_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    (0, common_1.Get)('pending-registrations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Pending Store Admin Registrations (Super Admin only)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getPendingRegistrations", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    (0, common_1.Patch)('approve/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve Store Admin (Super Admin only)' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "approveUser", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    (0, common_1.Patch)('reject/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject Store Admin (Super Admin only)' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "rejectUser", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    (0, common_1.Patch)('suspend/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Suspend Store Admin (Super Admin only)' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "suspendUser", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map