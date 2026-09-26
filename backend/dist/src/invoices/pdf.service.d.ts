import { S3Service } from '../common/s3.service';
export declare class PdfService {
    private s3Service;
    private readonly logger;
    constructor(s3Service: S3Service);
    private escapeHtml;
    private launchBrowser;
    generateInvoicePdf(invoice: any): Promise<string>;
}
