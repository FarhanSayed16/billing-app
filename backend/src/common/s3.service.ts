import { Injectable, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucketName: string;
  private readonly region: string;
  private readonly mockEnabled: boolean;

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('S3_REGION', 'ap-south-1');
    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME', 'billpush-assets');

    const accessKey = this.configService.get<string>('S3_ACCESS_KEY', '');
    const secretKey = this.configService.get<string>('S3_SECRET_KEY', '');
    const explicitMock = this.configService.get<string>('S3_MOCK', 'false') === 'true';
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    const looksPlaceholder =
      !accessKey ||
      !secretKey ||
      accessKey === 'xxx' ||
      secretKey === 'xxx' ||
      accessKey === 'your-access-key';

    this.mockEnabled = explicitMock || (!isProd && looksPlaceholder);

    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: accessKey || 'xxx',
        secretAccessKey: secretKey || 'xxx',
      },
    });
  }

  private assertConfigured() {
    const accessKey = this.configService.get<string>('S3_ACCESS_KEY', '');
    const secretKey = this.configService.get<string>('S3_SECRET_KEY', '');
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    const looksPlaceholder =
      !accessKey ||
      !secretKey ||
      accessKey === 'xxx' ||
      secretKey === 'xxx';

    if (isProd && looksPlaceholder && this.configService.get<string>('S3_MOCK') !== 'true') {
      throw new ServiceUnavailableException(
        'File storage is not configured. Set S3_ACCESS_KEY, S3_SECRET_KEY, and S3_BUCKET_NAME.',
      );
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    key: string,
    contentType: string,
  ): Promise<string> {
    if (this.mockEnabled) {
      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
    }

    this.assertConfigured();

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    try {
      await this.s3.send(command);
      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
    } catch (e) {
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
    return this.uploadBuffer(file.buffer, key, file.mimetype);
  }
}
