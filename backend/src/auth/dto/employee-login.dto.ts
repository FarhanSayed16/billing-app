import { IsString, IsNotEmpty, Length } from 'class-validator';

export class EmployeeLoginDto {
  @IsString()
  @IsNotEmpty()
  store_id!: string;

  @IsString()
  @IsNotEmpty()
  employee_id!: string;

  @IsString()
  @Length(4, 4, { message: 'PIN must be exactly 4 digits' })
  pin!: string;
}
