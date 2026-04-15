import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { RegisterStoreAdminDto } from './dto/register-store-admin.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { EmployeeLoginDto } from './dto/employee-login.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('setup')
  @ApiOperation({ summary: 'Super Admin Registration (First-Time Setup)' })
  setup(@Body() createSuperAdminDto: CreateSuperAdminDto) {
    return this.authService.setupSuperAdmin(createSuperAdminDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Store Admin Self-Registration' })
  register(@Body() registerStoreAdminDto: RegisterStoreAdminDto) {
    return this.authService.registerStoreAdmin(registerStoreAdminDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Admin Login (Super Admin & Store Admin)' })
  login(@Body() adminLoginDto: AdminLoginDto) {
    return this.authService.adminLogin(adminLoginDto);
  }

  @Post('employee-login')
  @ApiOperation({ summary: 'Employee Login via PIN' })
  employeeLogin(@Body() employeeLoginDto: EmployeeLoginDto) {
    return this.authService.employeeLogin(employeeLoginDto);
  }
}
