import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VehicleResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiProperty({ example: 'Toyota', maxLength: 100 })
  brand!: string;

  @ApiProperty({ example: 'Corolla', maxLength: 100 })
  model!: string;

  @ApiPropertyOptional({ example: '1.8L', maxLength: 120 })
  modelSpec!: string | null;

  @ApiPropertyOptional({ example: 2020 })
  year!: number | null;

  @ApiPropertyOptional({ example: '1.8L', maxLength: 120 })
  engine!: string | null;

  @ApiPropertyOptional({ example: 'Automatic', maxLength: 120 })
  transmission!: string | null;

  @ApiPropertyOptional({ example: 'Front-Wheel Drive', maxLength: 120 })
  drivetrain!: string | null;

  @ApiPropertyOptional({ example: 100000 })
  mileage!: number | null;

  @ApiPropertyOptional({ example: '1HGBH41JXMN109186', maxLength: 64 })
  vin!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}
