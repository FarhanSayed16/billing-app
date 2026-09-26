import { ConfigService } from '@nestjs/config';
export declare class S3Service {
    private configService;
    private readonly s3;
    private readonly bucketName;
    private readonly region;
    private readonly mockEnabled;
    constructor(configService: ConfigService);
    private assertConfigured;
    uploadBuffer(buffer: Buffer, key: string, contentType: string): Promise<string>;
    uploadFile(file: Express.Multer.File, key: string): Promise<string>;
}
