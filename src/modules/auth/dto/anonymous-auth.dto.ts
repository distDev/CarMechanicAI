import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AnonymousAuthDto {
  @ApiProperty()
  @IsString()
  deviceId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  platform?: string;
}
