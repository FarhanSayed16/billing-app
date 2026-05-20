import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('audit-logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get paginated audit logs for the brand' })
  findAll(@Req() req: any, @Query() query: any) {
    return this.auditLogsService.findAll(req.user.brandId, query);
  }

  @Get('export')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Export audit logs as CSV' })
  async exportLogs(@Req() req: any, @Query() query: any, @Res() res: Response) {
    const csvData = await this.auditLogsService.exportLogs(req.user.brandId, query);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${timestamp}.csv`);
    
    return res.status(200).send(csvData);
  }
}
