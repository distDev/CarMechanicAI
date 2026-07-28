import { ProblemStatus } from '@prisma/client';

export class CreateProblemResponseDto {
  id!: string;

  status!: ProblemStatus;

  aiSummary!: string | null;

  createdAt!: Date;
}
