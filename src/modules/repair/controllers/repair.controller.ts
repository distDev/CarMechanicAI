import { Controller } from '@nestjs/common';
import { RepairService } from '../services/repair.service';

@Controller('repair')
export class RepairController {
  constructor(private readonly repairService: RepairService) {}
}
