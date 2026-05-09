import type { Response } from 'express';
import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getGlobalAnalytics(req: any): Promise<{}>;
    getStoreAnalytics(paramStoreId: string, req: any): Promise<{}>;
    getRevenueChart(storeId: string, req: any): Promise<{
        date: string;
        revenue: number;
    }[]>;
    exportRevenue(req: any, startDate: string, endDate: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
