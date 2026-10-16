import { Module } from '@nestjs/common';

import { AiModule } from '@/infrastructure/ai/ai.module';

import { PrismaModule } from '@/infrastructure//prisma/prisma.module';

import { DiagnosisService } from './services/diagnosis.service';

@Module({
  imports: [AiModule, PrismaModule],
  providers: [DiagnosisService],
  exports: [DiagnosisService],
})
export class DiagnosisModule {}
