import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';

import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES,
} from '../constants/file-upload.constants';

export const multerOptions: MulterOptions = {
  storage: memoryStorage(),

  limits: {
    files: MAX_FILES,
    fileSize: MAX_FILE_SIZE,
  },

  fileFilter: (_req, file, callback) => {
    if (
      ALLOWED_MIME_TYPES.includes(
        file.mimetype as (typeof ALLOWED_MIME_TYPES)[number],
      )
    ) {
      callback(null, true);
      return;
    }

    callback(
      new BadRequestException(`Unsupported file type: ${file.mimetype}`),
      false,
    );
  },
};
