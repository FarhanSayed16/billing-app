import { IsString, IsNotEmpty, IsOptional, Matches, MaxLength } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9+\-\s]{8,20}$/, { message: 'Phone must be 8–20 digits (optional + - spaces)' })
  phone!: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  name?: string;
}
