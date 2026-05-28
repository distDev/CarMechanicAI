-- CreateEnum
CREATE TYPE "ProblemStatus" AS ENUM ('NEW', 'DIAGNOSING', 'REPAIRING', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "DiagnosisSessionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "RepairSessionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "StepType" AS ENUM ('DIAGNOSIS', 'REPAIR');

-- CreateEnum
CREATE TYPE "StepResultStatus" AS ENUM ('PENDING', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('DIAGNOSIS', 'REPAIR');

-- CreateEnum
CREATE TYPE "StepPartStatus" AS ENUM ('REQUIRED', 'ORDERED', 'INSTALLED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('PROBLEM', 'DIAGNOSIS_SESSION', 'REPAIR_SESSION', 'VEHICLE', 'CAUSE');

-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "brand" VARCHAR(100) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "model_spec" VARCHAR(120),
    "year" INTEGER,
    "engine" VARCHAR(120),
    "transmission" VARCHAR(120),
    "drivetrain" VARCHAR(120),
    "mileage" INTEGER,
    "vin" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problems" (
    "id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "error_code" VARCHAR(64),
    "ai_summary" TEXT,
    "confirmed_cause_id" UUID,
    "status" "ProblemStatus" NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnosis_sessions" (
    "id" UUID NOT NULL,
    "problem_id" UUID NOT NULL,
    "status" "DiagnosisSessionStatus" NOT NULL DEFAULT 'PENDING',
    "raw_ai_response" JSONB,
    "repair_preview" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "diagnosis_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "causes" (
    "id" UUID NOT NULL,
    "problem_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "probability" DOUBLE PRECISION,
    "ai_hint" TEXT,
    "is_user_created" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "causes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "steps" (
    "id" UUID NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "entity_id" UUID NOT NULL,
    "type" "StepType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL,
    "content" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "step_results" (
    "id" UUID NOT NULL,
    "step_id" UUID NOT NULL,
    "session_type" "SessionType" NOT NULL,
    "session_id" UUID NOT NULL,
    "status" "StepResultStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "step_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repair_sessions" (
    "id" UUID NOT NULL,
    "problem_id" UUID NOT NULL,
    "cause_id" UUID NOT NULL,
    "status" "RepairSessionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "repair_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "step_parts" (
    "id" UUID NOT NULL,
    "step_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" "StepPartStatus" NOT NULL DEFAULT 'REQUIRED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "step_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_conversations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "entity_type" "EntityType",
    "entity_id" UUID,
    "title" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vin_key" ON "vehicles"("vin");

-- CreateIndex
CREATE INDEX "vehicles_user_id_idx" ON "vehicles"("user_id");

-- CreateIndex
CREATE INDEX "problems_vehicle_id_idx" ON "problems"("vehicle_id");

-- CreateIndex
CREATE INDEX "problems_confirmed_cause_id_idx" ON "problems"("confirmed_cause_id");

-- CreateIndex
CREATE INDEX "problems_status_idx" ON "problems"("status");

-- CreateIndex
CREATE INDEX "diagnosis_sessions_problem_id_idx" ON "diagnosis_sessions"("problem_id");

-- CreateIndex
CREATE INDEX "diagnosis_sessions_status_idx" ON "diagnosis_sessions"("status");

-- CreateIndex
CREATE INDEX "causes_problem_id_idx" ON "causes"("problem_id");

-- CreateIndex
CREATE INDEX "steps_entity_type_entity_id_idx" ON "steps"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "steps_type_idx" ON "steps"("type");

-- CreateIndex
CREATE UNIQUE INDEX "steps_entity_type_entity_id_position_key" ON "steps"("entity_type", "entity_id", "position");

-- CreateIndex
CREATE INDEX "step_results_step_id_idx" ON "step_results"("step_id");

-- CreateIndex
CREATE INDEX "step_results_session_type_session_id_idx" ON "step_results"("session_type", "session_id");

-- CreateIndex
CREATE INDEX "step_results_status_idx" ON "step_results"("status");

-- CreateIndex
CREATE INDEX "repair_sessions_problem_id_idx" ON "repair_sessions"("problem_id");

-- CreateIndex
CREATE INDEX "repair_sessions_cause_id_idx" ON "repair_sessions"("cause_id");

-- CreateIndex
CREATE INDEX "repair_sessions_status_idx" ON "repair_sessions"("status");

-- CreateIndex
CREATE INDEX "step_parts_step_id_idx" ON "step_parts"("step_id");

-- CreateIndex
CREATE INDEX "step_parts_status_idx" ON "step_parts"("status");

-- CreateIndex
CREATE INDEX "chat_conversations_user_id_idx" ON "chat_conversations"("user_id");

-- CreateIndex
CREATE INDEX "chat_conversations_entity_type_entity_id_idx" ON "chat_conversations"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "chat_messages_conversation_id_idx" ON "chat_messages"("conversation_id");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problems" ADD CONSTRAINT "problems_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problems" ADD CONSTRAINT "problems_confirmed_cause_id_fkey" FOREIGN KEY ("confirmed_cause_id") REFERENCES "causes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnosis_sessions" ADD CONSTRAINT "diagnosis_sessions_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "causes" ADD CONSTRAINT "causes_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "step_results" ADD CONSTRAINT "step_results_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_sessions" ADD CONSTRAINT "repair_sessions_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_sessions" ADD CONSTRAINT "repair_sessions_cause_id_fkey" FOREIGN KEY ("cause_id") REFERENCES "causes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "step_parts" ADD CONSTRAINT "step_parts_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "chat_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
