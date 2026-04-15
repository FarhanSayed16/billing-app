import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateEmployeeDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsNotEmpty() phone!: string;
  @IsString() @Length(4, 4) pin!: string;
}
