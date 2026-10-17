import { Module } from '@nestjs/common';

import { AiModule } from '@/infrastructure/ai/ai.module';

import { PrismaModule } from '@/infrastructure//prisma/prisma.module';

import { DiagnosisService } from './services/diagnosis.service';
import { InitialDiagnosisPromptBuilder } from './prompt-builders/initial-diagnosis-prompt.builder';

@Module({
  imports: [AiModule, PrismaModule],
  providers: [DiagnosisService, InitialDiagnosisPromptBuilder],
  exports: [DiagnosisService],
})
export class DiagnosisModule {}
