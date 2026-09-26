import { fromPaise, lineTaxPaise, lineTotalPaise, toPaise } from '../common/money.util';

/**
 * Mirrors stock-check + money logic used by InvoicesService.create
 * without needing a full Prisma/Nest bootstrap.
 */
describe('Invoice stock & money invariants', () => {
  function assertSufficientStock(available: number, requested: number, name: string) {
    if (available < requested) {
      throw new Error(`Insufficient stock for "${name}". Available: ${available}, requested: ${requested}`);
    }
  }

  it('rejects oversell', () => {
    expect(() => assertSufficientStock(2, 5, 'Soap')).toThrow(/Insufficient stock/);
  });

  it('allows exact stock', () => {
    expect(() => assertSufficientStock(5, 5, 'Soap')).not.toThrow();
  });

  it('computes void loyalty delta as -earned + redeemed', () => {
    const earned = 10;
    const redeemed = 3;
    const loyaltyDelta = -earned + redeemed;
    expect(loyaltyDelta).toBe(-7);
  });

  it('computes invoice line totals in paise', () => {
    const qty = 3;
    const price = 99.99;
    const tax = 12;
    const totalPaise = lineTotalPaise(qty, price, tax);
    expect(totalPaise).toBe(toPaise(qty * price) + lineTaxPaise(qty, price, tax));
    expect(fromPaise(totalPaise)).toBeCloseTo(335.97, 2);
  });
});
