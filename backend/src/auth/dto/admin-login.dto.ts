import { IsEmail, IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class AdminLoginDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
