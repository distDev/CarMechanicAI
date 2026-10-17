import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, DiagnosisSessionStatus } from '@prisma/client';

import { AiService } from '@/infrastructure/ai/services/ai.service';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';

import { InitialDiagnosisParser } from '../parsers/initial-diagnosis.parser';
import { InitialDiagnosisPromptBuilder } from '../prompt-builders/initial-diagnosis-prompt.builder';

import { InitialDiagnosisPromptContext } from '../interfaces/initial-diagnosis-prompt-context.interface';
import { InitialDiagnosisResult } from '../interfaces/initial-diagnosis-result.interface';

const INITIAL_DIAGNOSIS_PROMPT_VERSION = 'v1';

@Injectable()
export class DiagnosisService {
  private readonly logger = new Logger(DiagnosisService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly promptBuilder: InitialDiagnosisPromptBuilder,
    private readonly parser: InitialDiagnosisParser,
  ) {}

  async startInitial(problemId: string): Promise<{
    sessionId: string;
    result: InitialDiagnosisResult;
  }> {
    const problem = await this.prisma.problem.findUnique({
      where: {
        id: problemId,
      },
      include: {
        vehicle: {
          select: {
            brand: true,
            model: true,
            modelSpec: true,
            year: true,
            engine: true,
            transmission: true,
            drivetrain: true,
            mileage: true,
          },
        },
      },
    });

    if (!problem) {
      throw new NotFoundException('Problem not found');
    }

    const context: InitialDiagnosisPromptContext = {
      problem: {
        description: problem.description,
        errorCode: problem.errorCode,
      },
      vehicle: {
        brand: problem.vehicle.brand,
        model: problem.vehicle.model,
        modelSpec: problem.vehicle.modelSpec,
        year: problem.vehicle.year,
        engine: problem.vehicle.engine,
        transmission: problem.vehicle.transmission,
        drivetrain: problem.vehicle.drivetrain,
        mileage: problem.vehicle.mileage,
      },
    };

    const contextSnapshot = JSON.parse(
      JSON.stringify(context),
    ) as Prisma.InputJsonObject;

    const session = await this.prisma.diagnosisSession.create({
      data: {
        problemId: problem.id,
        status: DiagnosisSessionStatus.PENDING,
        contextSnapshot,
        promptVersion: INITIAL_DIAGNOSIS_PROMPT_VERSION,
      },
    });

    try {
      await this.prisma.diagnosisSession.update({
        where: {
          id: session.id,
        },
        data: {
          status: DiagnosisSessionStatus.IN_PROGRESS,
        },
      });

      const prompt = this.promptBuilder.build(context);

      const aiResponse = await this.aiService.generate({
        prompt,
      });

      const result = this.parser.parse(aiResponse.content);

      await this.prisma.$transaction(async (tx) => {
        await tx.diagnosisCause.createMany({
          data: result.causes.map((cause, index) => ({
            sessionId: session.id,
            name: cause.name,
            description: cause.description,
            probability: cause.probability,
            estimatedMinutes: cause.estimatedMinutes,
            sortOrder: index + 1,
          })),
        });

        await tx.diagnosisSession.update({
          where: {
            id: session.id,
          },
          data: {
            status: DiagnosisSessionStatus.COMPLETED,
            summary: result.summary,
            estimatedMinutes: result.estimatedMinutes,
            rawAiResponse: aiResponse.content,
            repairPreview: {
              summary: result.repairPreview.summary,
              likelyActions: result.repairPreview.likelyActions,
            },
            aiProvider: aiResponse.platform,
            aiModel: aiResponse.model,
            promptVersion: INITIAL_DIAGNOSIS_PROMPT_VERSION,
            completedAt: new Date(),
          },
        });

        await tx.problem.update({
          where: {
            id: problem.id,
          },
          data: {
            aiSummary: result.summary,
          },
        });
      });

      return {
        sessionId: session.id,
        result,
      };
    } catch (error: unknown) {
      try {
        await this.prisma.diagnosisSession.update({
          where: {
            id: session.id,
          },
          data: {
            status: DiagnosisSessionStatus.FAILED,
            completedAt: new Date(),
          },
        });
      } catch (statusError: unknown) {
        this.logger.error(
          `Failed to mark diagnosis session ${session.id} as FAILED`,
          statusError instanceof Error
            ? statusError.stack
            : String(statusError),
        );
      }

      this.logger.error(
        `Initial diagnosis failed for session ${session.id}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }
}
