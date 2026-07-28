import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProblemStatus } from '@prisma/client';

export class ProblemListItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiPropertyOptional({ nullable: true })
  title!: string | null;

  @ApiProperty({ enum: ProblemStatus })
  status!: ProblemStatus;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  confirmedCauseId!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}
