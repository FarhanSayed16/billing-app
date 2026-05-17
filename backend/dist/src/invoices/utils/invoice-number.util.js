"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoiceNumber = generateInvoiceNumber;
function generateInvoiceNumber(storeName, year, seqNumber) {
    const cleanName = storeName.replace(/[^a-zA-Z]/g, '');
    const prefix = cleanName.length >= 2 ? cleanName.substring(0, 2).toUpperCase() : 'ST';
    const padSeq = seqNumber.toString().padStart(5, '0');
    return `${prefix}-${year}-${padSeq}`;
}
//# sourceMappingURL=invoice-number.util.js.map