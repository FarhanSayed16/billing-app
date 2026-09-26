import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ProductsService } from './products/products.service';
import { ProductsController } from './products/products.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { S3Service } from '../common/s3.service';

@Module({
  imports: [PrismaModule, CacheModule.register()],
  providers: [ProductsService, S3Service],
  controllers: [ProductsController]
})
export class CatalogModule {}
