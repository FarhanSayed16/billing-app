import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateStoreDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsNotEmpty() address!: string;
  @IsString() @IsNotEmpty() city!: string;
  @IsString() @IsNotEmpty() state!: string;
  @IsString() @IsNotEmpty() gst_number!: string;
  @IsString() @IsNotEmpty() phone!: string;
  
  @IsString() @IsOptional() logo_url?: string;
  @IsString() @IsOptional() brand_color?: string;
}
