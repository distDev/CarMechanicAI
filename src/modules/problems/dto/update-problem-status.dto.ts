import { IsEnum } from 'class-validator';

import { ProblemStatus } from '@prisma/client';

export class UpdateProblemStatusDto {
  @IsEnum(ProblemStatus)
  status!: ProblemStatus;
}
