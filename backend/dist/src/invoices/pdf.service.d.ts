import { S3Service } from '../common/s3.service';
export declare class PdfService {
    private s3Service;
    constructor(s3Service: S3Service);
    generateInvoicePdf(invoice: any): Promise<string>;
}
