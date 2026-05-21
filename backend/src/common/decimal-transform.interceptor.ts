import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Global interceptor that converts Prisma Decimal values (serialized as strings)
 * back to proper JavaScript numbers in all API responses.
 * 
 * Prisma with @prisma/adapter-pg serializes Decimal columns as strings 
 * (e.g. "1540.56" instead of 1540.56) to prevent precision loss in JS.
 * While technically correct, this breaks mobile clients that expect numeric types
 * for comparisons and arithmetic.
 */
@Injectable()
export class DecimalTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => this.transformDecimals(data)),
    );
  }

  private transformDecimals(data: any): any {
    if (data === null || data === undefined) return data;

    // Handle Prisma Decimal objects (they have a toNumber method)
    if (typeof data === 'object' && data !== null && typeof data.toNumber === 'function') {
      return data.toNumber();
    }

    // If it's a string that looks like a decimal number, convert it
    if (typeof data === 'string') {
      return this.maybeConvertNumericString(data);
    }

    // Recurse into arrays
    if (Array.isArray(data)) {
      return data.map(item => this.transformDecimals(item));
    }

    // Preserve Date objects
    if (data instanceof Date) {
      return data;
    }

    // Recurse into plain objects
    if (typeof data === 'object' && data !== null) {
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        // Only convert values for keys that are known decimal/money fields
        if (this.isDecimalField(key) && typeof value === 'string') {
          const num = parseFloat(value);
          result[key] = isNaN(num) ? value : num;
        } else {
          result[key] = this.transformDecimals(value);
        }
      }
      return result;
    }

    return data;
  }

  /**
   * Checks if a field name is a known decimal/monetary field from the Prisma schema.
   * This targeted approach avoids accidentally converting string IDs or codes.
   */
  private isDecimalField(key: string): boolean {
    const decimalFields = new Set([
      'base_price',
      'unit_price',
      'tax_rate',
      'tax_amount',
      'subtotal',
      'grand_total',
      'discount_amount',
      'loyalty_points',
      'loyalty_discount',
      'total',
      'refund_total',
      'today_revenue',
      'todayRevenue',
      'averageBillValue',
      'amount',
      'balance',
    ]);
    return decimalFields.has(key);
  }

  private maybeConvertNumericString(value: string): string {
    // Don't convert standalone strings — only convert when called from isDecimalField context
    return value;
  }
}
