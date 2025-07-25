/*
  Warnings:

  - You are about to drop the column `categories` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `features` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `numericId` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `sortOrder` on the `services` table. All the data in the column will be lost.
  - Added the required column `category` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "services_numericId_key";

-- DropIndex
DROP INDEX "services_slug_key";

-- AlterTable
ALTER TABLE "services" DROP COLUMN "categories",
DROP COLUMN "currency",
DROP COLUMN "features",
DROP COLUMN "numericId",
DROP COLUMN "slug",
DROP COLUMN "sortOrder",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "service_features" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_features_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "service_features" ADD CONSTRAINT "service_features_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
