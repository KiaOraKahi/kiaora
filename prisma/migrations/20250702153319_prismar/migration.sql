/*
  Warnings:

  - A unique constraint covering the columns `[orderNumber]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderNumber` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientName` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'CONFIRMED';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "orderNumber" TEXT NOT NULL,
ADD COLUMN     "recipientName" TEXT NOT NULL,
ADD COLUMN     "scheduledDate" TIMESTAMP(3),
ADD COLUMN     "specialInstructions" TEXT,
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Celebrity" ADD COLUMN     "achievements" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "averageRating" DOUBLE PRECISION DEFAULT 4.5,
ADD COLUMN     "completionRate" INTEGER NOT NULL DEFAULT 95,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "longBio" TEXT,
ADD COLUMN     "nextAvailable" TEXT DEFAULT '2024-01-15',
ADD COLUMN     "priceBusiness" DOUBLE PRECISION DEFAULT 599,
ADD COLUMN     "priceCharity" DOUBLE PRECISION DEFAULT 199,
ADD COLUMN     "pricePersonal" DOUBLE PRECISION DEFAULT 299,
ADD COLUMN     "responseTime" TEXT NOT NULL DEFAULT '24 hours',
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "rating" SET DEFAULT 4.5;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "occasion" TEXT,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "SampleVideo" (
    "id" TEXT NOT NULL,
    "celebrityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "thumbnail" TEXT,
    "duration" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SampleVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_orderNumber_key" ON "Booking"("orderNumber");

-- AddForeignKey
ALTER TABLE "SampleVideo" ADD CONSTRAINT "SampleVideo_celebrityId_fkey" FOREIGN KEY ("celebrityId") REFERENCES "Celebrity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
