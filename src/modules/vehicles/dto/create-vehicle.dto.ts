import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const CURRENT_YEAR = new Date().getFullYear();

export class CreateVehicleDto {
  @ApiProperty({ example: 'Toyota', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  brand!: string;

  @ApiProperty({ example: 'Corolla', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  model!: string;

  @ApiPropertyOptional({ example: '1.8L', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  modelSpec?: string;

  @ApiPropertyOptional({ example: 2020 })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(CURRENT_YEAR + 1)
  year?: number;

  @ApiPropertyOptional({ example: '1.8L', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  engine?: string;

  @ApiPropertyOptional({ example: 'Automatic', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  transmission?: string;

  @ApiPropertyOptional({ example: 'Front-Wheel Drive', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  drivetrain?: string;

  @ApiPropertyOptional({ example: 100000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  mileage?: number;

  @ApiPropertyOptional({ example: '1HGBH41JXMN109186', maxLength: 64 })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  vin?: string;
}
