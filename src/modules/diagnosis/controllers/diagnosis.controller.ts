import { Controller } from '@nestjs/common';
import { DiagnosisService } from '../services/diagnosis.service';

@Controller('diagnosis')
export class DiagnosisController {
  constructor(private readonly diagnosisService: DiagnosisService) {}
}
