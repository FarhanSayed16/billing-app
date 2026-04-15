import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCustomerDto {
  @IsString() @IsNotEmpty() phone!: string;
  @IsString() @IsOptional() name?: string;
}
