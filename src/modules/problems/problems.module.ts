import { Module } from '@nestjs/common';
import { ProblemService } from './services/problem.service';
import { ProblemsController } from './controllers/problems.controller';
import { PrismaModule } from '@/infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { VehicleProblemController } from './controllers/vehicle-problem.controller';
import { DiagnosisModule } from '@/modules/diagnosis/diagnosis.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    VehiclesModule,
    FileUploadModule,
    DiagnosisModule,
  ],
  controllers: [ProblemsController, VehicleProblemController],
  providers: [ProblemService],
  exports: [ProblemService],
})
export class ProblemsModule {}
