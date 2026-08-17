-- AlterTable
ALTER TABLE "InterviewSession" ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "transcript" JSONB;
