import { Module } from '@nestjs/common';
import { ProblemsService } from './services/problems.service';
import { ProblemsController } from './controllers/problems.controller';

@Module({
  controllers: [ProblemsController],
  providers: [ProblemsService],
})
export class ProblemsModule {}
