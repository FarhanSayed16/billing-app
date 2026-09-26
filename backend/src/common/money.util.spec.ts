import { toPaise, fromPaise, roundMoney, lineTaxPaise, lineTotalPaise } from './money.util';

describe('money.util', () => {
  it('rounds via paise to avoid float drift', () => {
    expect(toPaise(0.1 + 0.2)).toBe(30);
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
  });

  it('computes line tax and total in paise', () => {
    // 2 * 100.50 = 201.00; 18% tax = 36.18 → 3620? 
    // 20100 paise * 18 / 100 = 3618 paise
    expect(lineTaxPaise(2, 100.5, 18)).toBe(3618);
    expect(lineTotalPaise(2, 100.5, 18)).toBe(20100 + 3618);
    expect(fromPaise(lineTotalPaise(2, 100.5, 18))).toBe(237.18);
  });
});
