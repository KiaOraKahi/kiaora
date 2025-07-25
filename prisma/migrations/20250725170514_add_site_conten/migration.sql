-- DropIndex
DROP INDEX "Payout_stripeTransferId_key";

-- AlterTable
ALTER TABLE "Celebrity" ALTER COLUMN "preferredCurrency" SET DEFAULT 'nzd';

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "currency" SET DEFAULT 'nzd';

-- AlterTable
ALTER TABLE "Payout" ALTER COLUMN "currency" SET DEFAULT 'nzd';

-- AlterTable
ALTER TABLE "Tip" ALTER COLUMN "currency" SET DEFAULT 'nzd';

-- AlterTable
ALTER TABLE "Transfer" ALTER COLUMN "currency" SET DEFAULT 'nzd';

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "numericId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "fullDescription" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "startingPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'nzd',
    "asapPrice" DOUBLE PRECISION NOT NULL,
    "duration" TEXT NOT NULL,
    "deliveryTime" TEXT NOT NULL,
    "asapDeliveryTime" TEXT NOT NULL,
    "features" TEXT[],
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "services_numericId_key" ON "services"("numericId");
