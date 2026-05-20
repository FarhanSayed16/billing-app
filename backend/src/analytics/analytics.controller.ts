import { Controller, Get, Param, Query, UseGuards, Request, ForbiddenException, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Roles(Role.SUPER_ADMIN)
  @Get('global')
  @ApiOperation({ summary: 'Get global analytics for Super Admin' })
  async getGlobalAnalytics(@Request() req) {
    return this.analyticsService.getGlobalAnalytics(req.user.brandId);
  }

  @Roles(Role.SUPER_ADMIN, Role.STORE_ADMIN)
  @Get('store/:storeId')
  @ApiOperation({ summary: 'Get analytics for a specific store' })
  async getStoreAnalytics(@Param('storeId') paramStoreId: string, @Request() req) {
    const storeId = paramStoreId === 'mine' ? req.user.storeId : paramStoreId;
    
    // If STORE_ADMIN, ensure they are querying their own store
    if (req.user.role === Role.STORE_ADMIN && req.user.storeId !== storeId) {
      throw new ForbiddenException('You can only view analytics for your assigned store');
    }
    return this.analyticsService.getStoreAnalytics(req.user.brandId, storeId);
  }

  @Roles(Role.SUPER_ADMIN)
  @Get('revenue-chart')
  @ApiOperation({ summary: 'Get charting revenue data' })
  async getRevenueChart(@Query('store_id') storeId: string, @Request() req) {
    return this.analyticsService.getRevenueChart(req.user.brandId, storeId);
  }
  @Roles(Role.SUPER_ADMIN)
  @Get('export/revenue')
  @ApiOperation({ summary: 'Export revenue as CSV' })
  async exportRevenue(@Request() req: any, @Query('startDate') startDate: string, @Query('endDate') endDate: string, @Res() res: Response) {
    const csvData = await this.analyticsService.exportRevenue(req.user.brandId, startDate, endDate);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=revenue-${timestamp}.csv`);
    
    return res.status(200).send(csvData);
  }
}
