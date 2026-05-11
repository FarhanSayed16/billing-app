"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecimalTransformInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let DecimalTransformInterceptor = class DecimalTransformInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.map)(data => this.transformDecimals(data)));
    }
    transformDecimals(data) {
        if (data === null || data === undefined)
            return data;
        if (typeof data === 'object' && data !== null && typeof data.toNumber === 'function') {
            return data.toNumber();
        }
        if (typeof data === 'string') {
            return this.maybeConvertNumericString(data);
        }
        if (Array.isArray(data)) {
            return data.map(item => this.transformDecimals(item));
        }
        if (data instanceof Date) {
            return data;
        }
        if (typeof data === 'object' && data !== null) {
            const result = {};
            for (const [key, value] of Object.entries(data)) {
                if (this.isDecimalField(key) && typeof value === 'string') {
                    const num = parseFloat(value);
                    result[key] = isNaN(num) ? value : num;
                }
                else {
                    result[key] = this.transformDecimals(value);
                }
            }
            return result;
        }
        return data;
    }
    isDecimalField(key) {
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
    maybeConvertNumericString(value) {
        return value;
    }
};
exports.DecimalTransformInterceptor = DecimalTransformInterceptor;
exports.DecimalTransformInterceptor = DecimalTransformInterceptor = __decorate([
    (0, common_1.Injectable)()
], DecimalTransformInterceptor);
//# sourceMappingURL=decimal-transform.interceptor.js.map