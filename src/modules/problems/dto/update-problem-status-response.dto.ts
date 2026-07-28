import { ProblemStatus } from '@prisma/client';

export class UpdateProblemStatusResponseDto {
  id!: string;

  status!: ProblemStatus;

  updatedAt!: Date;
}
