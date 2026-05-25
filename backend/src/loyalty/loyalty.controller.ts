import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  // PUBLIC endpoint for customer web portal (no auth required)
  @Get('public/:phone/balance')
  async getPublicLoyaltyBalance(@Param('phone') phone: string) {
    return this.loyaltyService.getPublicLoyaltyByPhone(phone);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':customerId')
  @Roles('SUPER_ADMIN', 'STORE_ADMIN')
  async getCustomerLoyalty(@Request() req, @Param('customerId') customerId: string) {
    return this.loyaltyService.getCustomerLoyalty(req.user.brand_id, customerId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('customer/:phone/balance')
  @Roles('SUPER_ADMIN', 'STORE_ADMIN', 'EMPLOYEE')
  async getLoyaltyByPhone(@Request() req, @Param('phone') phone: string) {
    return this.loyaltyService.getCustomerLoyaltyByPhone(req.user.brand_id, phone);
  }
}
