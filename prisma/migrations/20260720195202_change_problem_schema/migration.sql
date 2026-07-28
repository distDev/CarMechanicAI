-- CreateTable
CREATE TABLE "problem_photos" (
    "id" UUID NOT NULL,
    "problem_id" UUID NOT NULL,
    "path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "problem_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "problem_photos_problem_id_idx" ON "problem_photos"("problem_id");

-- AddForeignKey
ALTER TABLE "problem_photos" ADD CONSTRAINT "problem_photos_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
