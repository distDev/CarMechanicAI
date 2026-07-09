import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { FOLDER_PATH_PATTERN } from '../constants/file-upload.constants';

export class UploadFilesDto {
  @ApiProperty({
    example: 'vehicles/photos',
    description: 'Target folder for uploaded files',
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Matches(FOLDER_PATH_PATTERN, {
    message: 'folder must contain only letters, numbers, /, _, and -',
  })
  folder!: string;
}
