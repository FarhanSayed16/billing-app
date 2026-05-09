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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cache_manager_1 = require("@nestjs/cache-manager");
const client_1 = require("@prisma/client");
let AnalyticsService = class AnalyticsService {
    prisma;
    cacheManager;
    constructor(prisma, cacheManager) {
        this.prisma = prisma;
        this.cacheManager = cacheManager;
    }
    async getGlobalAnalytics(brandId) {
        const cacheKey = `analytics:global:${brandId}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        const startOfPrevWeek = new Date(startOfWeek);
        startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 7);
        const [activeStores, uniqueCustomers, invoices, topProducts, newCustomersThisWeek, newCustomersLastWeek,] = await Promise.all([
            this.prisma.store.count({ where: { brand_id: brandId, is_active: true } }),
            this.prisma.customer.count({ where: { brand_id: brandId } }),
            this.prisma.invoice.findMany({
                where: { brand_id: brandId, status: { not: client_1.InvoiceStatus.FULLY_REFUNDED } },
                select: { grand_total: true, created_at: true, store_id: true },
            }),
            this.prisma.invoiceItem.groupBy({
                by: ['name'],
                _sum: { quantity: true },
                where: {
                    invoice: {
                        brand_id: brandId,
                        status: { not: client_1.InvoiceStatus.FULLY_REFUNDED },
                        created_at: { gte: startOfMonth },
                    },
                },
                orderBy: { _sum: { quantity: 'desc' } },
                take: 5,
            }),
            this.prisma.customer.count({
                where: { brand_id: brandId, created_at: { gte: startOfWeek } },
            }),
            this.prisma.customer.count({
                where: { brand_id: brandId, created_at: { gte: startOfPrevWeek, lt: startOfWeek } },
            }),
        ]);
        let revenueToday = 0;
        let revenueWeek = 0;
        let revenueMonth = 0;
        let revenueYear = 0;
        let revenuePrevMonth = 0;
        let billsToday = 0;
        let billsWeek = 0;
        let billsMonth = 0;
        const storeRevenues = {};
        for (const inv of invoices) {
            const amt = Number(inv.grand_total);
            const date = inv.created_at;
            if (date >= startOfYear)
                revenueYear += amt;
            if (date >= startOfMonth) {
                revenueMonth += amt;
                billsMonth++;
                storeRevenues[inv.store_id] = (storeRevenues[inv.store_id] || 0) + amt;
            }
            if (date >= startOfPrevMonth && date <= endOfPrevMonth) {
                revenuePrevMonth += amt;
            }
            if (date >= startOfWeek) {
                revenueWeek += amt;
                billsWeek++;
            }
            if (date >= startOfToday) {
                revenueToday += amt;
                billsToday++;
            }
        }
        let revenueChangePercent = 0;
        if (revenuePrevMonth > 0) {
            revenueChangePercent = ((revenueMonth - revenuePrevMonth) / revenuePrevMonth) * 100;
        }
        else if (revenueMonth > 0) {
            revenueChangePercent = 100;
        }
        const sortedStores = Object.entries(storeRevenues)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        const topStores = await Promise.all(sortedStores.map(async ([storeId, rev]) => {
            const store = await this.prisma.store.findUnique({ where: { id: storeId }, select: { name: true } });
            return { name: store?.name || 'Unknown', revenue: rev };
        }));
        const result = {
            revenue: {
                today: revenueToday,
                week: revenueWeek,
                month: revenueMonth,
                year: revenueYear,
                changePercent: Math.round(revenueChangePercent * 100) / 100,
            },
            invoices: {
                today: billsToday,
                week: billsWeek,
                month: billsMonth,
            },
            activeStores,
            uniqueCustomers,
            topStoresThisMonth: topStores,
            topProductsThisMonth: topProducts.map(p => ({ name: p.name, quantity: p._sum.quantity || 0 })),
            newCustomers: {
                thisWeek: newCustomersThisWeek,
                lastWeek: newCustomersLastWeek,
            },
        };
        await this.cacheManager.set(cacheKey, result, 300000);
        return result;
    }
    async getStoreAnalytics(brandId, storeId) {
        if (!storeId) {
            return {
                todayRevenue: 0,
                todayBills: 0,
                averageBillValue: 0,
                comparisonToYesterday: 0,
                weeklyBreakdown: Array(7).fill({ day: '', revenue: 0 }),
                peakHours: [],
                employeePerformance: [],
                topProducts: [],
                customerStats: {
                    total: 0,
                    newToday: 0,
                    newThisWeek: 0,
                }
            };
        }
        const cacheKey = `analytics:store:${storeId}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const invoices = await this.prisma.invoice.findMany({
            where: { store_id: storeId, brand_id: brandId, status: { not: client_1.InvoiceStatus.FULLY_REFUNDED } },
            select: { grand_total: true, created_at: true, employee_id: true },
        });
        let todayRev = 0;
        let todayBills = 0;
        let yesterdayRev = 0;
        const weeklyBreakdown = {};
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(d.getDate() + i);
            weeklyBreakdown[d.toISOString().split('T')[0]] = 0;
        }
        const peakHours = new Array(24).fill(0);
        const employeeBills = {};
        for (const inv of invoices) {
            const amt = Number(inv.grand_total);
            if (inv.created_at >= startOfToday) {
                todayRev += amt;
                todayBills++;
                peakHours[inv.created_at.getHours()]++;
            }
            else if (inv.created_at >= startOfYesterday && inv.created_at < startOfToday) {
                yesterdayRev += amt;
            }
            if (inv.created_at >= startOfWeek) {
                const dayKey = inv.created_at.toISOString().split('T')[0];
                if (weeklyBreakdown[dayKey] !== undefined) {
                    weeklyBreakdown[dayKey] += amt;
                }
                employeeBills[inv.employee_id] = (employeeBills[inv.employee_id] || 0) + 1;
            }
        }
        let percentageChange = 0;
        if (yesterdayRev > 0) {
            percentageChange = ((todayRev - yesterdayRev) / yesterdayRev) * 100;
        }
        else if (todayRev > 0) {
            percentageChange = 100;
        }
        const avgBill = todayBills > 0 ? todayRev / todayBills : 0;
        const employeePerformance = await Promise.all(Object.entries(employeeBills)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(async ([empId, count]) => {
            const emp = await this.prisma.user.findUnique({ where: { id: empId }, select: { name: true } });
            return { name: emp?.name || 'Unknown', bills: count };
        }));
        const topProducts = await this.prisma.invoiceItem.groupBy({
            by: ['name'],
            _sum: { quantity: true },
            where: {
                invoice: {
                    store_id: storeId,
                    brand_id: brandId,
                    status: { not: client_1.InvoiceStatus.FULLY_REFUNDED },
                    created_at: { gte: startOfWeek },
                },
            },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5,
        });
        const [totalCustomers, newCustomersThisWeek] = await Promise.all([
            this.prisma.customer.count({ where: { brand_id: brandId } }),
            this.prisma.customer.count({ where: { brand_id: brandId, created_at: { gte: startOfWeek } } }),
        ]);
        const result = {
            todayRevenue: todayRev,
            todayBills,
            averageBillValue: avgBill,
            comparisonToYesterday: Math.round(percentageChange * 100) / 100,
            weeklyBreakdown: Object.entries(weeklyBreakdown).map(([date, revenue]) => ({ date, revenue })),
            peakHours: peakHours.map((count, hour) => ({ hour, bills: count })).filter(h => h.bills > 0),
            employeePerformance,
            topProducts: topProducts.map(p => ({ name: p.name, quantity: p._sum.quantity || 0 })),
            customerStats: {
                total: totalCustomers,
                newThisWeek: newCustomersThisWeek,
            },
        };
        await this.cacheManager.set(cacheKey, result, 120000);
        return result;
    }
    async getRevenueChart(brandId, storeId) {
        const now = new Date();
        const days = 7;
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days + 1);
        const whereClause = { brand_id: brandId, status: { not: client_1.InvoiceStatus.FULLY_REFUNDED }, created_at: { gte: start } };
        if (storeId) {
            whereClause.store_id = storeId;
        }
        const invoices = await this.prisma.invoice.findMany({
            where: whereClause,
            select: { grand_total: true, created_at: true },
        });
        const chartData = {};
        for (let i = 0; i < days; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            chartData[d.toISOString().split('T')[0]] = 0;
        }
        for (const inv of invoices) {
            const day = inv.created_at.toISOString().split('T')[0];
            if (chartData[day] !== undefined) {
                chartData[day] += Number(inv.grand_total);
            }
        }
        const result = Object.entries(chartData)
            .map(([date, revenue]) => ({ date, revenue }))
            .sort((a, b) => a.date.localeCompare(b.date));
        return result;
    }
    async exportRevenue(brandId, startDate, endDate) {
        const whereClause = {
            brand_id: brandId,
            status: { not: client_1.InvoiceStatus.FULLY_REFUNDED }
        };
        if (startDate) {
            whereClause.created_at = { ...whereClause.created_at, gte: new Date(startDate) };
        }
        if (endDate) {
            whereClause.created_at = { ...whereClause.created_at, lte: new Date(endDate) };
        }
        const invoices = await this.prisma.invoice.findMany({
            where: whereClause,
            select: { grand_total: true, created_at: true, store: { select: { name: true } } },
            orderBy: { created_at: 'asc' },
        });
        let csvData = 'Date,Time,Store,Revenue\n';
        for (const inv of invoices) {
            const date = inv.created_at.toISOString().split('T')[0];
            const time = inv.created_at.toISOString().split('T')[1].split('.')[0];
            const storeName = inv.store?.name || 'Unknown';
            const rev = Number(inv.grand_total);
            csvData += `"${date}","${time}","${storeName}","${rev}"\n`;
        }
        return csvData;
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map