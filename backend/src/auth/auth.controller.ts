import { Controller, Post, Body, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { RegisterStoreAdminDto } from './dto/register-store-admin.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { EmployeeLoginDto } from './dto/employee-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from '@prisma/client';

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

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh Access Token' })
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  // --- Protected Endpoints ---

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Get('pending-registrations')
  @ApiOperation({ summary: 'Get Pending Store Admin Registrations (Super Admin only)' })
  getPendingRegistrations() {
    return this.authService.getPendingRegistrations();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Patch('approve/:userId')
  @ApiOperation({ summary: 'Approve Store Admin (Super Admin only)' })
  approveUser(@Param('userId') userId: string) {
    return this.authService.approveUser(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Patch('reject/:userId')
  @ApiOperation({ summary: 'Reject Store Admin (Super Admin only)' })
  rejectUser(@Param('userId') userId: string) {
    return this.authService.rejectUser(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Patch('suspend/:userId')
  @ApiOperation({ summary: 'Suspend Store Admin (Super Admin only)' })
  suspendUser(@Param('userId') userId: string) {
    return this.authService.suspendUser(userId);
  }
}
