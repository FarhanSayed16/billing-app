import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Req } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Roles(Role.EMPLOYEE, Role.STORE_ADMIN)
  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto, @Req() req: any) {
    return this.customersService.createOrLookup(createCustomerDto, req.user.brandId);
  }

  @Roles(Role.EMPLOYEE, Role.STORE_ADMIN)
  @Get('lookup/:phone')
  lookup(@Param('phone') phone: string, @Req() req: any) {
    return this.customersService.lookup(phone, req.user.brandId);
  }

  @Roles(Role.STORE_ADMIN, Role.SUPER_ADMIN)
  @Get()
  findAll(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('sort_by') sortBy?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.customersService.findAll(req.user.brandId, search, sortBy, page || 1, limit || 10);
  }

  @Roles(Role.STORE_ADMIN, Role.SUPER_ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.customersService.findOne(id, req.user.brandId);
  }

  @Roles(Role.STORE_ADMIN, Role.SUPER_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto, @Req() req: any) {
    return this.customersService.update(id, updateCustomerDto, req.user.brandId);
  }
}
