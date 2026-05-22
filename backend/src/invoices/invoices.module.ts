import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { PdfService } from './pdf.service';
import { S3Service } from '../common/s3.service';

@Module({
  controllers: [InvoicesController],
  providers: [InvoicesService, PdfService, S3Service],
})
export class InvoicesModule {}
