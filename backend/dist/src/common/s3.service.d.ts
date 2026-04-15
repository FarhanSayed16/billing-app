import { ConfigService } from '@nestjs/config';
export declare class S3Service {
    private configService;
    private readonly s3;
    private readonly bucketName;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, key: string): Promise<string>;
}
