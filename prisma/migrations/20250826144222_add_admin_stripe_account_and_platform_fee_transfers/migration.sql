-- AlterTable
ALTER TABLE "FinancialSettings" ADD COLUMN     "adminStripeAccountEmail" TEXT,
ADD COLUMN     "adminStripeAccountId" TEXT,
ADD COLUMN     "adminStripeAccountName" TEXT,
ADD COLUMN     "adminStripeAccountStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "lastPlatformFeePayout" TIMESTAMP(3),
ADD COLUMN     "platformFeeBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PlatformFeeTransfer" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'nzd',
    "stripeTransferId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformFeeTransfer_pkey" PRIMARY KEY ("id")
);
