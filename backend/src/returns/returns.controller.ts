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
    // If Super Admin, they might want to see across brand.
    // For now, limiting to the store if the user is a Store Admin,
    // or passing the brand to fetch all if Super Admin? 
    // The spec for Phase 3 just mentions pending returns for Store Admin.
    // We will use req.user.store_id or just let the service handle it based on brand if no store.
    const storeId = req.user.store_id; // Will be null for Super Admin possibly. 
    // Wait, the masterplan says Store Admin approves it. 
    // We'll pass both to the service. Let's assume Store Admin has store_id.
    return this.returnsService.getPendingReturns(storeId, req.user.brand_id);
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
