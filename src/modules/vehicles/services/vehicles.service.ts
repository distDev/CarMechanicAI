import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Vehicle } from '@prisma/client';

import { PrismaService } from '@/infrastructure/prisma/prisma.service';

import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<Vehicle[]> {
    return this.prisma.vehicle.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(vehicleId: string, userId: string): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        userId,
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async create(dto: CreateVehicleDto, userId: string): Promise<Vehicle> {
    try {
      return await this.prisma.vehicle.create({
        data: {
          userId,
          ...dto,
        },
      });
    } catch (error) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async update(
    vehicleId: string,
    dto: UpdateVehicleDto,
    userId: string,
  ): Promise<Vehicle> {
    await this.findOne(vehicleId, userId);

    try {
      return await this.prisma.vehicle.update({
        where: { id: vehicleId },
        data: dto,
      });
    } catch (error) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async delete(vehicleId: string, userId: string): Promise<Vehicle> {
    await this.findOne(vehicleId, userId);

    return this.prisma.vehicle.delete({
      where: { id: vehicleId },
    });
  }

  private handleUniqueConstraintError(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Vehicle with this VIN already exists');
    }
  }
}
