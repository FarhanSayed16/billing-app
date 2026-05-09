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
exports.AuditLogsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AuditLogsService = class AuditLogsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(brandId, query) {
        const { action, target_type, user_id, date_from, date_to, page = 1, limit = 20 } = query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = { brand_id: brandId };
        if (action)
            where.action = action;
        if (target_type)
            where.target_type = target_type;
        if (user_id)
            where.user_id = user_id;
        if (date_from)
            where.created_at = { ...where.created_at, gte: new Date(date_from) };
        if (date_to)
            where.created_at = { ...where.created_at, lte: new Date(date_to) };
        if (query.user_name) {
            where.user = { name: { contains: query.user_name, mode: 'insensitive' } };
        }
        const [data, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { created_at: 'desc' },
                include: {
                    user: { select: { id: true, name: true, role: true } },
                },
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        return {
            data,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
        };
    }
    async exportLogs(brandId, query) {
        const allData = await this.findAll(brandId, { ...query, page: 1, limit: 10000 });
        let csvData = 'Timestamp,Action,Target Type,Target ID,User Name,User Role\n';
        for (const log of allData.data) {
            const date = log.created_at.toISOString();
            const action = log.action;
            const targetType = log.target_type;
            const targetId = log.target_id;
            const userName = log.user?.name || 'System';
            const userRole = log.user?.role || '-';
            csvData += `"${date}","${action}","${targetType}","${targetId}","${userName}","${userRole}"\n`;
        }
        return csvData;
    }
};
exports.AuditLogsService = AuditLogsService;
exports.AuditLogsService = AuditLogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditLogsService);
//# sourceMappingURL=audit-logs.service.js.map