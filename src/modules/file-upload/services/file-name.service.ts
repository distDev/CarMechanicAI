import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { MIME_TYPE_EXTENSIONS } from '../constants/mime-types.constants';

interface GenerateFileNameOptions {
  folder: string;
  mimeType: string;
}

@Injectable()
export class FileNameService {
  generate(options: GenerateFileNameOptions): string {
    const extension = MIME_TYPE_EXTENSIONS[options.mimeType];

    if (!extension) {
      throw new BadRequestException(
        `Unsupported file type: ${options.mimeType}`,
      );
    }

    const folder = options.folder.replace(/^\/+|\/+$/g, '');

    return `${folder}/${randomUUID()}.${extension}`;
  }
}
