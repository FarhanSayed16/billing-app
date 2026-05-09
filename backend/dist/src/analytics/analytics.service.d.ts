import { PrismaService } from '../prisma/prisma.service';
import type { Cache } from 'cache-manager';
export declare class AnalyticsService {
    private readonly prisma;
    private cacheManager;
    constructor(prisma: PrismaService, cacheManager: Cache);
    getGlobalAnalytics(brandId: string): Promise<{}>;
    getStoreAnalytics(brandId: string, storeId: string): Promise<{}>;
    getRevenueChart(brandId: string, storeId?: string): Promise<{
        date: string;
        revenue: number;
    }[]>;
    exportRevenue(brandId: string, startDate?: string, endDate?: string): Promise<string>;
}
