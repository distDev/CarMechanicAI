import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { constants } from 'fs';
import { access, mkdir, unlink, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';

import { StoredFile } from '../interfaces/stored-file.interface';
import { StorageProvider } from '../interfaces/storage-provider.interface';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly uploadDir: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.getOrThrow<string>('UPLOAD_DIR');
    this.publicUrl = this.configService.getOrThrow<string>('FILE_PUBLIC_URL');
  }

  async upload(file: Express.Multer.File, path: string): Promise<StoredFile> {
    const fullPath = this.resolveSafePath(path);

    await mkdir(dirname(fullPath), {
      recursive: true,
    });

    await writeFile(fullPath, file.buffer);

    return {
      path,
      mimeType: file.mimetype,
      size: file.size,
      originalName: file.originalname,
    };
  }

  async delete(path: string): Promise<void> {
    await unlink(this.resolveSafePath(path));
  }

  async exists(path: string): Promise<boolean> {
    try {
      await access(this.resolveSafePath(path), constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  getUrl(path: string): string {
    return `${this.publicUrl}/${path}`;
  }

  private resolveSafePath(path: string): string {
    const fullPath = resolve(this.uploadDir, path);
    const resolvedUploadDir = resolve(this.uploadDir);

    if (
      fullPath !== resolvedUploadDir &&
      !fullPath.startsWith(`${resolvedUploadDir}/`)
    ) {
      throw new BadRequestException('Invalid file path');
    }

    return fullPath;
  }
}
