/*
  Warnings:

  - You are about to drop the column `confirmed_cause_id` on the `problems` table. All the data in the column will be lost.
  - You are about to drop the column `cause_id` on the `repair_sessions` table. All the data in the column will be lost.
  - You are about to drop the `causes` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DiagnosisAttemptStatus" AS ENUM ('IN_PROGRESS', 'CONFIRMED', 'RULED_OUT', 'INCONCLUSIVE', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "DiagnosisStepResponseType" AS ENUM ('CHOICE', 'NUMBER', 'TEXT');

-- CreateEnum
CREATE TYPE "DiagnosisStepResult" AS ENUM ('FOUND', 'NOT_FOUND', 'UNCERTAIN', 'SKIPPED');

-- CreateEnum
CREATE TYPE "DiagnosisStepSkipReason" AS ENUM ('NO_TOOL', 'USER_SKIPPED');

-- AlterEnum
ALTER TYPE "EntityType" ADD VALUE 'DIAGNOSIS_STEP';

-- DropForeignKey
ALTER TABLE "causes" DROP CONSTRAINT "causes_problem_id_fkey";

-- DropForeignKey
ALTER TABLE "problems" DROP CONSTRAINT "problems_confirmed_cause_id_fkey";

-- DropForeignKey
ALTER TABLE "repair_sessions" DROP CONSTRAINT "repair_sessions_cause_id_fkey";

-- DropIndex
DROP INDEX "diagnosis_sessions_problem_id_idx";

-- DropIndex
DROP INDEX "problems_confirmed_cause_id_idx";

-- DropIndex
DROP INDEX "repair_sessions_cause_id_idx";

-- AlterTable
ALTER TABLE "diagnosis_sessions" ADD COLUMN     "ai_model" VARCHAR(100),
ADD COLUMN     "ai_provider" VARCHAR(50),
ADD COLUMN     "context_snapshot" JSONB,
ADD COLUMN     "estimated_minutes" INTEGER,
ADD COLUMN     "previous_session_id" UUID,
ADD COLUMN     "prompt_version" VARCHAR(50),
ADD COLUMN     "summary" TEXT;

-- AlterTable
ALTER TABLE "problems" DROP COLUMN "confirmed_cause_id";

-- AlterTable
ALTER TABLE "repair_sessions" DROP COLUMN "cause_id";

-- DropTable
DROP TABLE "causes";

-- CreateTable
CREATE TABLE "diagnosis_causes" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "probability" DOUBLE PRECISION,
    "estimated_minutes" INTEGER,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnosis_causes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnosis_attempts" (
    "id" UUID NOT NULL,
    "cause_id" UUID NOT NULL,
    "status" "DiagnosisAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "result_summary" TEXT,
    "raw_ai_response" JSONB,
    "ai_provider" VARCHAR(50),
    "ai_model" VARCHAR(100),
    "prompt_version" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "diagnosis_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnosis_steps" (
    "id" UUID NOT NULL,
    "attempt_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "instruction" TEXT NOT NULL,
    "question" TEXT,
    "response_type" "DiagnosisStepResponseType" NOT NULL,
    "options" JSONB,
    "input_config" JSONB,
    "required_tools" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "safety_note" TEXT,
    "result" "DiagnosisStepResult",
    "answer" JSONB,
    "comment" TEXT,
    "skip_reason" "DiagnosisStepSkipReason",
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnosis_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repair_session_causes" (
    "repair_session_id" UUID NOT NULL,
    "diagnosis_attempt_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repair_session_causes_pkey" PRIMARY KEY ("repair_session_id","diagnosis_attempt_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "diagnosis_causes_session_id_sort_order_key" ON "diagnosis_causes"("session_id", "sort_order");

-- CreateIndex
CREATE INDEX "diagnosis_attempts_cause_id_idx" ON "diagnosis_attempts"("cause_id");

-- CreateIndex
CREATE INDEX "diagnosis_attempts_status_idx" ON "diagnosis_attempts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "diagnosis_steps_attempt_id_position_key" ON "diagnosis_steps"("attempt_id", "position");

-- CreateIndex
CREATE INDEX "repair_session_causes_diagnosis_attempt_id_idx" ON "repair_session_causes"("diagnosis_attempt_id");

-- CreateIndex
CREATE INDEX "diagnosis_sessions_problem_id_created_at_idx" ON "diagnosis_sessions"("problem_id", "created_at");

-- CreateIndex
CREATE INDEX "diagnosis_sessions_previous_session_id_idx" ON "diagnosis_sessions"("previous_session_id");

-- AddForeignKey
ALTER TABLE "diagnosis_sessions" ADD CONSTRAINT "diagnosis_sessions_previous_session_id_fkey" FOREIGN KEY ("previous_session_id") REFERENCES "diagnosis_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnosis_causes" ADD CONSTRAINT "diagnosis_causes_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "diagnosis_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnosis_attempts" ADD CONSTRAINT "diagnosis_attempts_cause_id_fkey" FOREIGN KEY ("cause_id") REFERENCES "diagnosis_causes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnosis_steps" ADD CONSTRAINT "diagnosis_steps_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "diagnosis_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_session_causes" ADD CONSTRAINT "repair_session_causes_repair_session_id_fkey" FOREIGN KEY ("repair_session_id") REFERENCES "repair_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_session_causes" ADD CONSTRAINT "repair_session_causes_diagnosis_attempt_id_fkey" FOREIGN KEY ("diagnosis_attempt_id") REFERENCES "diagnosis_attempts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
