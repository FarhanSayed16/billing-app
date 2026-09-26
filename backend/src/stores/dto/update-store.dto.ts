import { IsString, IsOptional, MaxLength, Matches, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

/** Partial store update — all fields optional. Empty GST clears the field. */
export class UpdateStoreDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  state?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? null : value))
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString()
  @MaxLength(30)
  gst_number?: string | null;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-\s]{8,20}$/, { message: 'Phone must be 8–20 digits' })
  phone?: string;

  @IsOptional()
  @IsString()
  logo_url?: string;

  @IsOptional()
  @IsString()
  brand_color?: string;
}
