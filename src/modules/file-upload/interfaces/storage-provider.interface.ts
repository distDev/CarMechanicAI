import { StoredFile } from './stored-file.interface';

export interface StorageProvider {
  upload(file: Express.Multer.File, path: string): Promise<StoredFile>;

  delete(path: string): Promise<void>;

  exists(path: string): Promise<boolean>;

  getUrl(path: string): string;
}
