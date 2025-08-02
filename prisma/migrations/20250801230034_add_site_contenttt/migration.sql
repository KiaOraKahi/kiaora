/*
  Warnings:

  - You are about to drop the column `priceBusiness` on the `Celebrity` table. All the data in the column will be lost.
  - You are about to drop the column `priceCharity` on the `Celebrity` table. All the data in the column will be lost.
  - You are about to drop the column `pricePersonal` on the `Celebrity` table. All the data in the column will be lost.
  - You are about to drop the column `achievements` on the `celebrity_applications` table. All the data in the column will be lost.
  - You are about to drop the column `availability` on the `celebrity_applications` table. All the data in the column will be lost.
  - You are about to drop the column `basePrice` on the `celebrity_applications` table. All the data in the column will be lost.
  - You are about to drop the column `followerCount` on the `celebrity_applications` table. All the data in the column will be lost.
  - You are about to drop the column `motivation` on the `celebrity_applications` table. All the data in the column will be lost.
  - You are about to drop the column `profession` on the `celebrity_applications` table. All the data in the column will be lost.
  - You are about to drop the column `rushPrice` on the `celebrity_applications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Celebrity" DROP COLUMN "priceBusiness",
DROP COLUMN "priceCharity",
DROP COLUMN "pricePersonal";

-- AlterTable
ALTER TABLE "celebrity_applications" DROP COLUMN "achievements",
DROP COLUMN "availability",
DROP COLUMN "basePrice",
DROP COLUMN "followerCount",
DROP COLUMN "motivation",
DROP COLUMN "profession",
DROP COLUMN "rushPrice",
ALTER COLUMN "nationality" DROP NOT NULL;
