-- CreateEnum
CREATE TYPE "CelebrityApplicationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REQUIRES_CHANGES');

-- CreateTable
CREATE TABLE "CelebrityApplication" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "achievements" TEXT NOT NULL,
    "socialMedia" TEXT NOT NULL,
    "followerCount" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "rushPrice" DOUBLE PRECISION NOT NULL,
    "languages" TEXT[],
    "availability" TEXT NOT NULL,
    "specialRequests" TEXT,
    "motivation" TEXT NOT NULL,
    "profilePhotoUrl" TEXT,
    "idDocumentUrl" TEXT,
    "verificationDocUrl" TEXT,
    "status" "CelebrityApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CelebrityApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CelebrityApplication_email_key" ON "CelebrityApplication"("email");
