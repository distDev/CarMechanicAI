import { Module } from '@nestjs/common';

import { AiModule } from '@/infrastructure/ai/ai.module';

import { PrismaModule } from '@/infrastructure//prisma/prisma.module';

import { DiagnosisService } from './services/diagnosis.service';
import { InitialDiagnosisPromptBuilder } from './prompt-builders/initial-diagnosis-prompt.builder';
import { InitialDiagnosisParser } from './parsers/initial-diagnosis.parser';

@Module({
  imports: [AiModule, PrismaModule],
  providers: [
    DiagnosisService,
    InitialDiagnosisPromptBuilder,
    InitialDiagnosisParser,
  ],
  exports: [DiagnosisService],
})
export class DiagnosisModule {}
