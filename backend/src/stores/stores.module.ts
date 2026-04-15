import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { S3Service } from '../common/s3.service';

@Module({
  controllers: [StoresController],
  providers: [StoresService, S3Service],
})
export class StoresModule {}
