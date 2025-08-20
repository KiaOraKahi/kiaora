-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'Kia Ora Kahi',
    "siteDescription" TEXT NOT NULL DEFAULT 'Connect with celebrities for personalized video messages',
    "contactEmail" TEXT NOT NULL DEFAULT 'admin@kiaora.com',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialSettings" (
    "id" TEXT NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "minimumPayout" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "payoutSchedule" TEXT NOT NULL DEFAULT 'weekly',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialSettings_pkey" PRIMARY KEY ("id")
);
