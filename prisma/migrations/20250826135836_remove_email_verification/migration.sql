/*
  Warnings:

  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "isVerified" SET DEFAULT true;

-- DropTable
DROP TABLE "VerificationToken";

-- DropEnum
DROP TYPE "TokenType";
