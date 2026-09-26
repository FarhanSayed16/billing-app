import { IsString, IsEmail, MinLength, IsNotEmpty, MaxLength, Matches } from 'class-validator';

export class RegisterStoreAdminDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9+\-\s]{8,20}$/, { message: 'Phone must be 8–20 digits (optional + - spaces)' })
  phone!: string;
}
