import { BadRequestException } from '@nestjs/common';
import { ReturnsService } from './returns.service';

describe('ReturnsService JWT field mapping', () => {
  it('uses brandId/storeId/userId from JWT user (not snake_case)', async () => {
    const prisma = {
      brand: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };

    const service = new ReturnsService(prisma as any);
    const jwtUser = {
      brandId: 'brand-1',
      storeId: 'store-1',
      userId: 'user-1',
      // Intentionally wrong snake_case — must be ignored
      brand_id: undefined,
      store_id: undefined,
      id: undefined,
    };

    await expect(
      service.createReturn(jwtUser, { billing_id: 'ABC', items: [], reason: 'test' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.brand.findUnique).toHaveBeenCalledWith({
      where: { id: 'brand-1' },
      select: { return_auto_approve_threshold: true, loyalty_points_per_100: true },
    });
  });
});
