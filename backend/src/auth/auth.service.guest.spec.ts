import { ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService.guestLogin gate', () => {
  it('rejects when ENABLE_GUEST_LOGIN is not true', async () => {
    const configService = {
      get: jest.fn((key: string, fallback?: string) => {
        if (key === 'ENABLE_GUEST_LOGIN') return 'false';
        if (key === 'REDIS_URL') return 'redis://localhost:6379';
        return fallback;
      }),
    };

    // Minimal stub — constructor needs prisma/jwt/redis but guest gate runs first
    const service = Object.create(AuthService.prototype) as AuthService;
    (service as any).configService = configService;

    await expect(service.guestLogin('SUPER_ADMIN')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows when ENABLE_GUEST_LOGIN=true and continues to DB lookup', async () => {
    const configService = {
      get: jest.fn((key: string, fallback?: string) => {
        if (key === 'ENABLE_GUEST_LOGIN') return 'true';
        return fallback;
      }),
    };
    const prisma = {
      user: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };

    const service = Object.create(AuthService.prototype) as AuthService;
    (service as any).configService = configService;
    (service as any).prisma = prisma;

    await expect(service.guestLogin()).rejects.toThrow(/not set up/i);
    expect(prisma.user.findFirst).toHaveBeenCalled();
  });
});
