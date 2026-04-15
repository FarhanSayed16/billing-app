import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID, ValidateNested, ArrayMinSize, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
  @IsUUID() @IsOptional() product_id?: string;
  @IsString() @IsNotEmpty() name!: string;
  @IsNumber() @Min(1) quantity!: number;
  @IsNumber() @Min(0) unit_price!: number;
  @IsNumber() @Min(0) tax_rate!: number;
}

export class CreateInvoiceDto {
  @IsUUID() @IsOptional() customer_id?: string;
  @IsString() @IsOptional() customer_phone?: string;
  @IsString() @IsOptional() customer_name?: string;

  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  @ArrayMinSize(1)
  items!: InvoiceItemDto[];

  @IsNumber() @Min(0) @IsOptional() discount_amount?: number = 0;
  @IsNumber() @Min(0) @IsOptional() loyalty_points_redeemed?: number = 0;
}
