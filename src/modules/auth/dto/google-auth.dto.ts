import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({ description: 'Google ID token from the client SDK' })
  @IsString()
  idToken!: string;

  @ApiProperty({ description: 'Unique device identifier' })
  @IsString()
  deviceId!: string;

  @ApiPropertyOptional({
    description: 'Device platform, e.g. ios, android, web',
  })
  @IsOptional()
  @IsString()
  platform?: string;
}
