/**
 * Money helpers — prefer integer paise to avoid JS float drift.
 */
export function toPaise(amount: number | string): number {
  const n = typeof amount === 'string' ? Number(amount) : amount;
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export function fromPaise(paise: number): number {
  return paise / 100;
}

/** Round a rupee amount to 2 decimal places via paise. */
export function roundMoney(amount: number | string): number {
  return fromPaise(toPaise(amount));
}

export function lineTaxPaise(quantity: number, unitPrice: number, taxRatePercent: number): number {
  const linePaise = toPaise(quantity * unitPrice);
  return Math.round((linePaise * taxRatePercent) / 100);
}

export function lineTotalPaise(quantity: number, unitPrice: number, taxRatePercent: number): number {
  return toPaise(quantity * unitPrice) + lineTaxPaise(quantity, unitPrice, taxRatePercent);
}
