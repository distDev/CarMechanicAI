import {
  Injectable,
  NotImplementedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { FileUploadService } from '@/modules/file-upload/services/file-upload.service';
import { VehiclesService } from '@/modules/vehicles/services/vehicles.service';

import { ProblemStatus, Problem } from '@prisma/client';

import { CreateProblemDto } from '../dto/create-problem.dto';
import { CreateProblemResponseDto } from '../dto/create-problem-response.dto';
import { UpdateProblemStatusResponseDto } from '../dto/update-problem-status-response.dto';
import { ProblemListItemDto } from '../dto/problem-list-item.dto';

import { FileMetadata } from '@/modules/file-upload/interfaces/file-metadata.interface';

@Injectable()
export class ProblemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vehiclesService: VehiclesService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async create(
    dto: CreateProblemDto,
    files: Express.Multer.File[],
    userId: string,
  ): Promise<CreateProblemResponseDto> {
    await this.vehiclesService.findOne(dto.vehicleId, userId);

    let uploadedFiles: FileMetadata[] = [];

    try {
      uploadedFiles = await this.fileUploadService.uploadMany(files, {
        folder: 'problems',
      });

      const problem = await this.prisma.problem.create({
        data: {
          vehicleId: dto.vehicleId,

          description: dto.description,

          errorCode: dto.errorCode,

          status: ProblemStatus.DIAGNOSING,

          aiSummary: null,

          photos: {
            create: uploadedFiles.map((file) => ({
              path: file.path,
            })),
          },

          diagnosisSessions: {
            create: {},
          },
        },
      });

      return {
        id: problem.id,
        status: problem.status,
        aiSummary: problem.aiSummary,
        createdAt: problem.createdAt,
      };
    } catch (error) {
      await this.fileUploadService.deleteMany(
        uploadedFiles.map((file) => file.path),
      );

      throw error;
    }
  }

  async findAllByVehicleId(
    vehicleId: string,
    userId: string,
  ): Promise<ProblemListItemDto[]> {
    await this.vehiclesService.findOne(vehicleId, userId);

    const problems = await this.prisma.problem.findMany({
      where: {
        vehicleId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        aiSummary: true,
        status: true,
        confirmedCauseId: true,
        updatedAt: true,
      },
    });

    return problems.map((problem) => ({
      id: problem.id,
      title: problem.aiSummary,
      status: problem.status,
      confirmedCauseId: problem.confirmedCauseId,
      updatedAt: problem.updatedAt,
    }));
  }

  findOne(id: string) {
    throw new NotImplementedException();
  }

  async updateStatus(
    problemId: string,
    status: ProblemStatus,
    userId: string,
  ): Promise<UpdateProblemStatusResponseDto> {
    const problem = await this.findOneForUser(problemId, userId);

    this.validateTransition(problem.status, status);

    const updatedProblem = await this.prisma.problem.update({
      where: {
        id: problemId,
      },
      data: {
        status,
      },
    });

    return {
      id: updatedProblem.id,
      status: updatedProblem.status,
      updatedAt: updatedProblem.updatedAt,
    };
  }

  private async findOneForUser(
    problemId: string,
    userId: string,
  ): Promise<Problem> {
    const problem = await this.prisma.problem.findFirst({
      where: {
        id: problemId,
        vehicle: { userId },
      },
    });

    if (!problem) {
      throw new NotFoundException('Problem not found');
    }

    return problem;
  }

  private validateTransition(
    currentStatus: ProblemStatus,
    nextStatus: ProblemStatus,
  ): void {
    const allowedTransitions: Record<ProblemStatus, ProblemStatus[]> = {
      [ProblemStatus.NEW]: [],

      [ProblemStatus.DIAGNOSING]: [
        ProblemStatus.REPAIRING,
        ProblemStatus.CLOSED,
      ],

      [ProblemStatus.REPAIRING]: [ProblemStatus.RESOLVED],

      [ProblemStatus.RESOLVED]: [ProblemStatus.CLOSED],

      [ProblemStatus.CLOSED]: [],
    };

    if (!allowedTransitions[currentStatus].includes(nextStatus)) {
      throw new BadRequestException(
        `Cannot change status from ${currentStatus} to ${nextStatus}`,
      );
    }
  }
}
