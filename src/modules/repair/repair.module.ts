import { Module } from '@nestjs/common';
import { RepairService } from './services/repair.service';
import { RepairController } from './controllers/repair.controller';

@Module({
  controllers: [RepairController],
  providers: [RepairService],
})
export class RepairModule {}
