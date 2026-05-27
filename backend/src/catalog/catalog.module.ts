import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ProductsService } from './products/products.service';
import { ProductsController } from './products/products.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, CacheModule.register()],
  providers: [ProductsService],
  controllers: [ProductsController]
})
export class CatalogModule {}
