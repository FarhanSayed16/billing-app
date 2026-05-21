import { Module } from '@nestjs/common';
import { ProductsService } from './products/products.service';
import { ProductsController } from './products/products.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ProductsService],
  controllers: [ProductsController]
})
export class CatalogModule {}
