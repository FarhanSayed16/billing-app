import { IsString, IsNotEmpty, IsArray, ValidateNested, IsNumber, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ReturnItemDto {
  @IsString()
  @IsNotEmpty()
  invoice_item_id: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateReturnDto {
  @IsString()
  @IsNotEmpty()
  billing_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items: ReturnItemDto[];

  @IsString()
  @IsOptional()
  reason?: string;
}
