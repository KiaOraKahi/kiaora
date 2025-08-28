/*
  Warnings:

  - Added the required column `achievements` to the `celebrity_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `availability` to the `celebrity_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `basePrice` to the `celebrity_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `followerCount` to the `celebrity_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motivation` to the `celebrity_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profession` to the `celebrity_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rushPrice` to the `celebrity_applications` table without a default value. This is not possible if the table is not empty.
  - Made the column `nationality` on table `celebrity_applications` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preferredLanguage" TEXT NOT NULL DEFAULT 'en';

-- Update existing nationality values
UPDATE "celebrity_applications" SET "nationality" = 'Not specified' WHERE "nationality" IS NULL;

-- AlterTable
ALTER TABLE "celebrity_applications" ADD COLUMN     "achievements" TEXT,
ADD COLUMN     "availability" TEXT,
ADD COLUMN     "basePrice" DOUBLE PRECISION,
ADD COLUMN     "followerCount" TEXT,
ADD COLUMN     "motivation" TEXT,
ADD COLUMN     "profession" TEXT,
ADD COLUMN     "rushPrice" DOUBLE PRECISION;

-- Update existing records with default values
UPDATE "celebrity_applications" SET 
    "achievements" = "experience",
    "availability" = '24 hours',
    "basePrice" = 299.0,
    "followerCount" = '0',
    "motivation" = "experience",
    "profession" = "category",
    "rushPrice" = 399.0;

-- Make columns NOT NULL after updating
ALTER TABLE "celebrity_applications" 
ALTER COLUMN "nationality" SET NOT NULL,
ALTER COLUMN "achievements" SET NOT NULL,
ALTER COLUMN "availability" SET NOT NULL,
ALTER COLUMN "basePrice" SET NOT NULL,
ALTER COLUMN "followerCount" SET NOT NULL,
ALTER COLUMN "motivation" SET NOT NULL,
ALTER COLUMN "profession" SET NOT NULL,
ALTER COLUMN "rushPrice" SET NOT NULL;
