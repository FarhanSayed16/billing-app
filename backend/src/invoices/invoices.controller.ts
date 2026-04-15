import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  // PUBLIC ENDPOINTS (must be declared BEFORE parameterized :id routes)

  @Get('billing/:billingId')
  @ApiOperation({ summary: 'PUBLIC: Get full invoice detail by billing ID (no auth)' })
  findOnePublic(@Param('billingId') billingId: string) {
    return this.invoicesService.findOneByBillingId(billingId);
  }

  @Get('customer/:phone')
  @ApiOperation({ summary: 'PUBLIC: Get summary list of invoices by customer phone (no auth)' })
  findCustomerSummary(@Param('phone') phone: string) {
    return this.invoicesService.findCustomerSummary(phone);
  }

  // PROTECTED ENDPOINTS

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Post()
  @Roles(Role.EMPLOYEE)
  @ApiOperation({ summary: 'Create a new invoice (Employee only)' })
  create(@Body() createInvoiceDto: CreateInvoiceDto, @Req() req: any) {
    return this.invoicesService.create(createInvoiceDto, req.user.storeId, req.user.userId, req.user.brandId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Get()
  @Roles(Role.SUPER_ADMIN, Role.STORE_ADMIN, Role.EMPLOYEE)
  @ApiOperation({ summary: 'List invoices based on role and filters' })
  findAll(@Req() req: any, @Query() query: any) {
    return this.invoicesService.findAll(req.user.brandId, query, req.user.role, req.user.storeId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.STORE_ADMIN, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Get specific invoice details' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.invoicesService.findOne(id, req.user.role, req.user.storeId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Patch(':id/void')
  @Roles(Role.STORE_ADMIN)
  @ApiOperation({ summary: 'Void an invoice (Store Admin only)' })
  voidInvoice(@Param('id') id: string, @Req() req: any) {
    return this.invoicesService.voidInvoice(id, req.user.storeId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Get(':id/pdf')
  @Roles(Role.SUPER_ADMIN, Role.STORE_ADMIN, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Get or generate invoice PDF' })
  getGeneratePdf(@Param('id') id: string, @Req() req: any) {
    return this.invoicesService.getGeneratePdf(id, req.user.role, req.user.storeId, req.user.userId);
  }
}
