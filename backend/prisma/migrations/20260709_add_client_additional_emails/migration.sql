-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "additional_emails" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
