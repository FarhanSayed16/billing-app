import { Controller, Post, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateReturnDto } from './dto/create-return.dto';

@Controller('returns')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'STORE_ADMIN', 'EMPLOYEE')
  async createReturn(@Request() req, @Body() createReturnDto: CreateReturnDto) {
    return this.returnsService.createReturn(req.user, createReturnDto);
  }

  @Get('pending')
  @Roles('SUPER_ADMIN', 'STORE_ADMIN')
  async getPendingReturns(@Request() req) {
    return this.returnsService.getPendingReturns(req.user.storeId, req.user.brandId);
  }

  @Patch(':id/approve')
  @Roles('SUPER_ADMIN', 'STORE_ADMIN')
  async approveReturn(@Request() req, @Param('id') id: string) {
    return this.returnsService.approveReturn(req.user, id);
  }

  @Patch(':id/reject')
  @Roles('SUPER_ADMIN', 'STORE_ADMIN')
  async rejectReturn(@Request() req, @Param('id') id: string) {
    return this.returnsService.rejectReturn(req.user, id);
  }
}
