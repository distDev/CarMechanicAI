import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProblemDto {
  @ApiProperty({
    example: 'b45f9f5a-e46f-49cb-95f9-a50e55e979ad',
    maxLength: 100,
  })
  @IsUUID()
  vehicleId!: string;

  @ApiProperty({
    example: 'Сломалась тормозная система',
    description: 'Описание проблемы',
    maxLength: 5000,
  })
  @IsString()
  @MaxLength(5000)
  description!: string;

  @ApiPropertyOptional({
    example: '10535',
    description: 'Код ошибки',
    maxLength: 64,
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  errorCode?: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Список прикрепленных файлов/фотографий',
    required: false,
  })
  files?: any[];
}
