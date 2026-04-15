import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ResetPinDto } from './dto/reset-pin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get('login-list/:storeId')
  @ApiOperation({ summary: 'Public: Get active employees for login dropdown' })
  getLoginList(@Param('storeId') storeId: string) {
    return this.employeesService.getLoginList(storeId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STORE_ADMIN)
  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto, @Req() req: any) {
    return this.employeesService.create(createEmployeeDto, req.user.brandId, req.user.storeId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STORE_ADMIN, Role.SUPER_ADMIN)
  @Get()
  findAll(@Req() req: any, @Query('storeId') queryStoreId?: string) {
    const storeId = req.user.role === Role.SUPER_ADMIN && queryStoreId ? queryStoreId : req.user.storeId;
    return this.employeesService.findAll(req.user.brandId, storeId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STORE_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto, @Req() req: any) {
    return this.employeesService.update(id, updateEmployeeDto, req.user.brandId, req.user.storeId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STORE_ADMIN)
  @Patch(':id/reset-pin')
  resetPin(@Param('id') id: string, @Body() resetPinDto: ResetPinDto, @Req() req: any) {
    return this.employeesService.resetPin(id, resetPinDto, req.user.brandId, req.user.storeId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STORE_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.employeesService.remove(id, req.user.brandId, req.user.storeId);
  }
}
