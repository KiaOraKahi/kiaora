/*
  Warnings:

  - A unique constraint covering the columns `[numericId]` on the table `services` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "services" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'nzd',
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "numericId" SERIAL NOT NULL,
ADD COLUMN     "samples" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "talents" JSONB NOT NULL DEFAULT '[]';

-- CreateIndex
CREATE UNIQUE INDEX "services_numericId_key" ON "services"("numericId");
