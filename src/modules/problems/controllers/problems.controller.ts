import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiConsumes,
} from '@nestjs/swagger';

import { ProblemService } from '../services/problem.service';
import { FilesInterceptor } from '@nestjs/platform-express';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

import { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { CreateProblemDto } from '../dto/create-problem.dto';
import { UpdateProblemStatusDto } from '../dto/update-problem-status.dto';
import { CreateProblemResponseDto } from '@modules/problems/dto/create-problem-response.dto';
import { UpdateProblemStatusResponseDto } from '../dto/update-problem-status-response.dto';

import { multerOptions } from '@modules/file-upload/config/multer.config';

@ApiTags('Problems')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('problems')
export class ProblemsController {
  constructor(private readonly problemService: ProblemService) {}

  @Post()
  @ApiOperation({ summary: 'Create a problem' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ type: CreateProblemResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Vehicle not found' })
  @UseInterceptors(
    FilesInterceptor('files', multerOptions.limits!.files, multerOptions),
  )
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProblemDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.problemService.create(dto, files ?? [], user.id);
  }

  // TODO: Доделать, когда появится модуль диагностики и ремонта
  @Get(':id')
  @ApiOperation({ summary: 'Get a problem by id' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.problemService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update problem status' })
  @ApiOkResponse({ type: UpdateProblemStatusResponseDto })
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProblemStatusDto,
  ) {
    return this.problemService.updateStatus(id, dto.status, user.id);
  }
}
