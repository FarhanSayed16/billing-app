import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';

export class RegisterStoreAdminDto {
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
}
