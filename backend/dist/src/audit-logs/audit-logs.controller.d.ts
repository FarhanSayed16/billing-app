import { AuditLogsService } from './audit-logs.service';
import type { Response } from 'express';
export declare class AuditLogsController {
    private readonly auditLogsService;
    constructor(auditLogsService: AuditLogsService);
    findAll(req: any, query: any): Promise<{
        data: ({
            user: {
                id: string;
                name: string;
                role: import("@prisma/client").$Enums.Role;
            };
        } & {
            id: string;
            brand_id: string;
            created_at: Date;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            action: string;
            target_type: string;
            target_id: string;
            ip_address: string | null;
            user_id: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    exportLogs(req: any, query: any, res: Response): Promise<Response<any, Record<string, any>>>;
}
