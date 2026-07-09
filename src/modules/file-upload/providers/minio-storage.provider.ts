import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';

import { StoredFile } from '../interfaces/stored-file.interface';
import { StorageProvider } from '../interfaces/storage-provider.interface';

@Injectable()
export class MinioStorageProvider implements StorageProvider {
  private readonly logger = new Logger(MinioStorageProvider.name);

  private readonly client: Client;

  private readonly bucket: string;

  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.getOrThrow<string>('MINIO_BUCKET');

    this.publicUrl = this.configService.getOrThrow<string>('FILE_PUBLIC_URL');

    this.client = new Client({
      endPoint: this.configService.getOrThrow<string>('MINIO_ENDPOINT'),
      port: this.configService.getOrThrow<number>('MINIO_PORT'),
      useSSL: this.configService.getOrThrow<boolean>('MINIO_USE_SSL'),
      accessKey: this.configService.getOrThrow<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.getOrThrow<string>('MINIO_SECRET_KEY'),
    });
  }

  async upload(file: Express.Multer.File, path: string): Promise<StoredFile> {
    await this.ensureBucketExists();

    await this.client.putObject(this.bucket, path, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });

    return {
      path,
      mimeType: file.mimetype,
      size: file.size,
      originalName: file.originalname,
    };
  }

  async delete(path: string): Promise<void> {
    await this.client.removeObject(this.bucket, path);
  }

  async exists(path: string): Promise<boolean> {
    try {
      await this.client.statObject(this.bucket, path);
      return true;
    } catch {
      return false;
    }
  }

  getUrl(path: string): string {
    return `${this.publicUrl}/${path}`;
  }

  private async ensureBucketExists(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucket);

    if (exists) {
      return;
    }

    await this.client.makeBucket(this.bucket);

    this.logger.log(`Bucket "${this.bucket}" created.`);
  }
}
