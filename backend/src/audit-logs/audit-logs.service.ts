import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(brandId: string, query: any) {
    const { action, target_type, user_id, date_from, date_to, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { brand_id: brandId };

    if (action) where.action = action;
    if (target_type) where.target_type = target_type;
    if (user_id) where.user_id = user_id;
    if (date_from) where.created_at = { ...where.created_at, gte: new Date(date_from) };
    if (date_to) where.created_at = { ...where.created_at, lte: new Date(date_to) };
    
    // Support wildcard search on userName if explicitly requested
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

  async exportLogs(brandId: string, query: any) {
    // Generate CSV string or use json2csv block
    const allData = await this.findAll(brandId, { ...query, page: 1, limit: 10000 }); // Export up to 10k logs
    
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
}
