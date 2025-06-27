/*
  Warnings:

  - You are about to drop the `CelebrityApplication` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REQUIRES_CHANGES');

-- DropTable
DROP TABLE "CelebrityApplication";

-- DropEnum
DROP TYPE "CelebrityApplicationStatus";

-- CreateTable
CREATE TABLE "celebrity_applications" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "achievements" TEXT NOT NULL,
    "instagramHandle" TEXT,
    "twitterHandle" TEXT,
    "tiktokHandle" TEXT,
    "youtubeHandle" TEXT,
    "otherSocialMedia" TEXT,
    "followerCount" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "rushPrice" DOUBLE PRECISION NOT NULL,
    "languages" TEXT[],
    "availability" TEXT NOT NULL,
    "specialRequests" TEXT,
    "motivation" TEXT NOT NULL,
    "hasProfilePhoto" BOOLEAN NOT NULL DEFAULT false,
    "hasIdDocument" BOOLEAN NOT NULL DEFAULT false,
    "hasVerificationDocument" BOOLEAN NOT NULL DEFAULT false,
    "profilePhotoUrl" TEXT,
    "idDocumentUrl" TEXT,
    "verificationDocumentUrl" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,

    CONSTRAINT "celebrity_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "celebrity_applications_email_key" ON "celebrity_applications"("email");
