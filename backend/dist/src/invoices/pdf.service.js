"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const puppeteer = __importStar(require("puppeteer"));
const qrcode = __importStar(require("qrcode"));
const s3_service_1 = require("../common/s3.service");
let PdfService = class PdfService {
    s3Service;
    constructor(s3Service) {
        this.s3Service = s3Service;
    }
    async generateInvoicePdf(invoice) {
        const qrDataUrl = await qrcode.toDataURL(invoice.billing_id);
        const itemsHtml = invoice.items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>₹${Number(item.unit_price).toFixed(2)}</td>
        <td>${Number(item.tax_rate).toFixed(1)}%</td>
        <td>₹${Number(item.total).toFixed(2)}</td>
      </tr>
    `).join('');
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; }
          .header img { max-height: 80px; margin-bottom: 10px; }
          .header h1 { margin: 0; font-size: 24px; color: ${invoice.store.brand_color || '#333'}; }
          .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-box { width: 48%; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f8f8f8; font-weight: bold; }
          .totals { width: 50%; float: right; }
          .totals-row { display: flex; justify-content: space-between; padding: 5px 0; }
          .totals-row.grand { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 10px; }
          .footer { clear: both; text-align: center; margin-top: 50px; font-size: 12px; color: #777; }
          .qr-section { text-align: center; margin-top: 30px; clear: both; }
          .qr-section img { width: 150px; height: 150px; }
        </style>
      </head>
      <body>
        <div class="header">
          ${invoice.store.logo_url ? `<img src="${invoice.store.logo_url}" />` : ''}
          <h1>${invoice.store.name}</h1>
          <p>${invoice.store.address}, ${invoice.store.city}</p>
          <p>Ph: ${invoice.store.phone} | GST: ${invoice.store.gst_number || 'N/A'}</p>
        </div>

        <div class="info-section">
          <div class="info-box">
            <h3>Invoice to:</h3>
            <p>${invoice.customer?.name || 'Guest User'}</p>
            ${invoice.customer?.phone ? `<p>Ph: ${invoice.customer.phone}</p>` : ''}
          </div>
          <div class="info-box" style="text-align: right;">
            <h3>Invoice Details:</h3>
            <p><strong>No:</strong> ${invoice.invoice_number}</p>
            <p><strong>Date:</strong> ${new Date(invoice.created_at).toLocaleDateString()}</p>
            <p><strong>Billing ID:</strong> ${invoice.billing_id}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Tax %</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row"><span>Subtotal:</span> <span>₹${Number(invoice.subtotal).toFixed(2)}</span></div>
          <div class="totals-row"><span>Tax Amount:</span> <span>₹${Number(invoice.tax_amount).toFixed(2)}</span></div>
          ${Number(invoice.discount_amount) > 0 ? `<div class="totals-row"><span>Discount:</span> <span>-₹${Number(invoice.discount_amount).toFixed(2)}</span></div>` : ''}
          ${Number(invoice.loyalty_discount) > 0 ? `<div class="totals-row"><span>Loyalty Discount:</span> <span>-₹${Number(invoice.loyalty_discount).toFixed(2)}</span></div>` : ''}
          <div class="totals-row grand"><span>Grand Total:</span> <span>₹${Number(invoice.grand_total).toFixed(2)}</span></div>
        </div>

        <div class="qr-section">
          <p>Scan to view invoice online</p>
          <img src="${qrDataUrl}" alt="QR Code" />
        </div>

        <div class="footer">
          <p>Powered by <strong>BillPush</strong></p>
          <a href="https://billpush.com">billpush.com</a>
        </div>
      </body>
      </html>
    `;
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();
        const mockFile = {
            fieldname: 'file',
            originalname: `${invoice.billing_id}.pdf`,
            encoding: '7bit',
            mimetype: 'application/pdf',
            size: pdfBuffer.length,
            buffer: Buffer.from(pdfBuffer),
            stream: null,
            destination: '',
            filename: '',
            path: ''
        };
        const key = `invoices/${invoice.store_id}/${invoice.billing_id}.pdf`;
        const s3Url = await this.s3Service.uploadFile(mockFile, key);
        return s3Url;
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [s3_service_1.S3Service])
], PdfService);
//# sourceMappingURL=pdf.service.js.map