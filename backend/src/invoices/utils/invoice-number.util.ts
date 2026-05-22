export function generateInvoiceNumber(storeName: string, year: number, seqNumber: number): string {
  const cleanName = storeName.replace(/[^a-zA-Z]/g, '');
  const prefix = cleanName.length >= 2 ? cleanName.substring(0, 2).toUpperCase() : 'ST';
  const padSeq = seqNumber.toString().padStart(5, '0');
  return `${prefix}-${year}-${padSeq}`;
}
