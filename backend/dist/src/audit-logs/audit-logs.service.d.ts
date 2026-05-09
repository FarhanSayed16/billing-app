import { PrismaService } from '../prisma/prisma.service';
export declare class AuditLogsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(brandId: string, query: any): Promise<{
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
            action: string;
            target_type: string;
            target_id: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            ip_address: string | null;
            user_id: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    exportLogs(brandId: string, query: any): Promise<string>;
}
