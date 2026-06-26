import { Controller } from '@nestjs/common';
import { ProblemsService } from '../services/problems.service';

@Controller('problems')
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}
}
