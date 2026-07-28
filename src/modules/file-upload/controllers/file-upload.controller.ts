import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

import { multerOptions } from '@modules/file-upload/config/multer.config';

import { FileMetadataResponseDto } from '../dto/file-metadata-response.dto';
import { UploadFilesDto } from '../dto/upload-files.dto';
import { FileMetadata } from '../interfaces/file-metadata.interface';
import { FileUploadService } from '../services/file-upload.service';

@ApiTags('Files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload one or more files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['files', 'folder'],
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        folder: {
          type: 'string',
          example: 'vehicles/photos',
        },
      },
    },
  })
  @ApiOkResponse({ type: FileMetadataResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @UseInterceptors(
    FilesInterceptor('files', multerOptions.limits!.files, multerOptions),
  )
  async upload(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadFilesDto,
  ): Promise<FileMetadata[]> {
    if (!files?.length) {
      throw new BadRequestException('At least one file is required');
    }

    return this.fileUploadService.uploadMany(files, dto);
  }
}
