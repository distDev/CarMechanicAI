import { Module } from '@nestjs/common';
import { VehiclesService } from './services/vehicles.service';
import { VehiclesController } from './controllers/vehicles.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '@/infrastructure/prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
