import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from '@/modules/auth/auth.module';

import { STORAGE_PROVIDER } from './constants/storage.constants';
import { FileUploadController } from './controllers/file-upload.controller';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { MinioStorageProvider } from './providers/minio-storage.provider';
import { FileNameService } from './services/file-name.service';
import { FileUploadService } from './services/file-upload.service';

import { StorageDriver } from './enums/storage-driver.enum';

@Module({
  imports: [ConfigModule, AuthModule],

  controllers: [FileUploadController],

  providers: [
    FileNameService,

    LocalStorageProvider,

    MinioStorageProvider,

    {
      provide: STORAGE_PROVIDER,

      inject: [ConfigService, LocalStorageProvider, MinioStorageProvider],

      useFactory: (
        configService: ConfigService,
        localStorageProvider: LocalStorageProvider,
        minioStorageProvider: MinioStorageProvider,
      ) => {
        const driver = configService.getOrThrow<StorageDriver>(
          'FILE_STORAGE_DRIVER',
        );

        return driver === StorageDriver.MINIO
          ? minioStorageProvider
          : localStorageProvider;
      },
    },

    FileUploadService,
  ],

  exports: [FileUploadService],
})
export class FileUploadModule {}
