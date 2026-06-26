import { Module } from '@nestjs/common';
import { DiagnosisService } from './services/diagnosis.service';
import { DiagnosisController } from './controllers/diagnosis.controller';

@Module({
  controllers: [DiagnosisController],
  providers: [DiagnosisService],
})
export class DiagnosisModule {}
