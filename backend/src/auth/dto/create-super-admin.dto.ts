import { IsString, IsEmail, MinLength, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSuperAdminDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  brand_name!: string;

  @IsString()
  @IsOptional()
  brand_gst?: string;
}
