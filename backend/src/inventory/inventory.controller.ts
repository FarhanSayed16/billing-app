import { Controller, Get, Patch, Param, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Roles(Role.SUPER_ADMIN, Role.STORE_ADMIN)
  @Get(':storeId')
  @ApiOperation({ summary: 'Get store inventory' })
  async getInventory(@Param('storeId') paramStoreId: string, @Request() req) {
    const storeId = paramStoreId === 'mine' ? req.user.storeId : paramStoreId;
    
    if (req.user.role === Role.STORE_ADMIN && req.user.storeId !== storeId) {
      throw new ForbiddenException('You can only view inventory for your assigned store');
    }
    
    return this.inventoryService.getStoreInventory(req.user.brandId, storeId);
  }

  @Roles(Role.STORE_ADMIN)
  @Patch(':storeId/:productId')
  @ApiOperation({ summary: 'Adjust stock quantity' })
  async adjustStock(
    @Param('storeId') paramStoreId: string,
    @Param('productId') productId: string,
    @Body('quantity') quantity: number,
    @Body('reason') reason: string,
    @Request() req
  ) {
    const storeId = paramStoreId === 'mine' ? req.user.storeId : paramStoreId;
    
    if (req.user.storeId !== storeId) {
      throw new ForbiddenException('You can only adjust inventory for your assigned store');
    }
    
    return this.inventoryService.adjustStock(storeId, productId, quantity, reason, req.user.userId, req.user.brandId);
  }
}
