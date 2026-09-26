import { Controller, Post, Body, Get, Patch, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
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
import { Throttle } from '@nestjs/throttler';

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

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  @ApiOperation({ summary: 'Admin Login (Super Admin & Store Admin)' })
  login(@Body() adminLoginDto: AdminLoginDto) {
    return this.authService.adminLogin(adminLoginDto);
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
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

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('guest-login')
  @ApiOperation({ summary: 'Guest Login — explore the app without credentials (disabled unless ENABLE_GUEST_LOGIN=true)' })
  guestLogin(@Body() body: { role?: string }) {
    return this.authService.guestLogin(body?.role);
  }

  // --- Protected Endpoints ---

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  getMe(@Req() req: any) {
    return this.authService.getMe(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('fcm-token')
  @ApiOperation({ summary: 'Register or clear device FCM push token' })
  updateFcmToken(@Req() req: any, @Body() body: { fcm_token?: string | null }) {
    return this.authService.updateFcmToken(req.user.userId, body?.fcm_token ?? null);
  }

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
  approveUser(@Param('userId') userId: string, @Req() req: any) {
    if (req.user.isGuest) throw new ForbiddenException('Guest users cannot approve registrations');
    return this.authService.approveUser(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Patch('reject/:userId')
  @ApiOperation({ summary: 'Reject Store Admin (Super Admin only)' })
  rejectUser(@Param('userId') userId: string, @Req() req: any) {
    if (req.user.isGuest) throw new ForbiddenException('Guest users cannot reject registrations');
    return this.authService.rejectUser(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Patch('suspend/:userId')
  @ApiOperation({ summary: 'Suspend Store Admin (Super Admin only)' })
  suspendUser(@Param('userId') userId: string, @Req() req: any) {
    if (req.user.isGuest) throw new ForbiddenException('Guest users cannot suspend users');
    return this.authService.suspendUser(userId);
  }
}
