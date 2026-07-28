import { Inject, Injectable } from '@nestjs/common';

import { STORAGE_PROVIDER } from '../constants/storage.constants';
import { FileMetadata } from '../interfaces/file-metadata.interface';
import { StorageProvider } from '../interfaces/storage-provider.interface';
import { UploadOptions } from '../interfaces/upload-options.interface';
import { FileNameService } from './file-name.service';

@Injectable()
export class FileUploadService {
  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: StorageProvider,

    private readonly fileNameService: FileNameService,
  ) {}

  async upload(
    file: Express.Multer.File,
    options: UploadOptions,
  ): Promise<FileMetadata> {
    const path = this.fileNameService.generate({
      folder: options.folder,
      mimeType: file.mimetype,
    });

    const storedFile = await this.storageProvider.upload(file, path);

    return {
      ...storedFile,
      url: this.storageProvider.getUrl(storedFile.path),
    };
  }

  async uploadMany(
    files: Express.Multer.File[],
    options: UploadOptions,
  ): Promise<FileMetadata[]> {
    return Promise.all(files.map((file) => this.upload(file, options)));
  }

  async delete(path: string): Promise<void> {
    await this.storageProvider.delete(path);
  }

  async deleteMany(paths: string[]): Promise<void> {
    await Promise.all(paths.map((path) => this.delete(path)));
  }
}
