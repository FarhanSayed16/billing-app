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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CustomersService = class CustomersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createOrLookup(createCustomerDto, brandId) {
        const existing = await this.prisma.customer.findUnique({
            where: {
                brand_id_phone: { brand_id: brandId, phone: createCustomerDto.phone },
            },
        });
        if (existing) {
            return this.formatCustomer(existing);
        }
        const newCustomer = await this.prisma.customer.create({
            data: {
                brand_id: brandId,
                phone: createCustomerDto.phone,
                name: createCustomerDto.name || 'Guest',
            },
        });
        return this.formatCustomer(newCustomer);
    }
    async lookup(phone, brandId) {
        const customer = await this.prisma.customer.findUnique({
            where: {
                brand_id_phone: { brand_id: brandId, phone },
            },
        });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        return this.formatCustomer(customer);
    }
    async findAll(brandId, search, sortBy, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const whereClause = { brand_id: brandId };
        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.customer.findMany({
                where: whereClause,
                orderBy: { [sortBy || 'created_at']: 'desc' },
                skip,
                take: Number(limit),
            }),
            this.prisma.customer.count({ where: whereClause }),
        ]);
        return {
            data: data.map(this.formatCustomer),
            meta: { total, page: Number(page), limit: Number(limit), total_pages: Math.ceil(total / limit) },
        };
    }
    async findOne(id, brandId) {
        const customer = await this.prisma.customer.findFirst({
            where: { id, brand_id: brandId },
            include: {
                invoices: {
                    orderBy: { created_at: 'desc' },
                    take: 10,
                },
            },
        });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        return customer;
    }
    async update(id, updateCustomerDto, brandId) {
        const customer = await this.prisma.customer.findFirst({
            where: { id, brand_id: brandId },
        });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        return this.prisma.customer.update({
            where: { id },
            data: { name: updateCustomerDto.name },
        });
    }
    formatCustomer(customer) {
        return {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            total_visits: customer.total_visits,
            loyalty_points: customer.loyalty_points,
        };
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map