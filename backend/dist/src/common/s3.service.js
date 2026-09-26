"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const config_1 = require("@nestjs/config");
let S3Service = class S3Service {
    configService;
    s3;
    bucketName;
    region;
    mockEnabled;
    constructor(configService) {
        this.configService = configService;
        this.region = this.configService.get('S3_REGION', 'ap-south-1');
        this.bucketName = this.configService.get('S3_BUCKET_NAME', 'billpush-assets');
        const accessKey = this.configService.get('S3_ACCESS_KEY', '');
        const secretKey = this.configService.get('S3_SECRET_KEY', '');
        const explicitMock = this.configService.get('S3_MOCK', 'false') === 'true';
        const isProd = this.configService.get('NODE_ENV') === 'production';
        const looksPlaceholder = !accessKey ||
            !secretKey ||
            accessKey === 'xxx' ||
            secretKey === 'xxx' ||
            accessKey === 'your-access-key';
        this.mockEnabled = explicitMock || (!isProd && looksPlaceholder);
        this.s3 = new client_s3_1.S3Client({
            region: this.region,
            credentials: {
                accessKeyId: accessKey || 'xxx',
                secretAccessKey: secretKey || 'xxx',
            },
        });
    }
    assertConfigured() {
        const accessKey = this.configService.get('S3_ACCESS_KEY', '');
        const secretKey = this.configService.get('S3_SECRET_KEY', '');
        const isProd = this.configService.get('NODE_ENV') === 'production';
        const looksPlaceholder = !accessKey ||
            !secretKey ||
            accessKey === 'xxx' ||
            secretKey === 'xxx';
        if (isProd && looksPlaceholder && this.configService.get('S3_MOCK') !== 'true') {
            throw new common_1.ServiceUnavailableException('File storage is not configured. Set S3_ACCESS_KEY, S3_SECRET_KEY, and S3_BUCKET_NAME.');
        }
    }
    async uploadBuffer(buffer, key, contentType) {
        if (this.mockEnabled) {
            return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
        }
        this.assertConfigured();
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        });
        try {
            await this.s3.send(command);
            return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
        }
        catch (e) {
            throw new common_1.InternalServerErrorException('Failed to upload file to S3');
        }
    }
    async uploadFile(file, key) {
        return this.uploadBuffer(file.buffer, key, file.mimetype);
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3Service);
//# sourceMappingURL=s3.service.js.map