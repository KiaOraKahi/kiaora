-- Fix Production Database Schema for Platform Fees Functionality
-- Run this script on your production database to add missing columns and tables

-- Add missing columns to FinancialSettings table
ALTER TABLE "FinancialSettings" 
ADD COLUMN IF NOT EXISTS "adminStripeAccountEmail" TEXT,
ADD COLUMN IF NOT EXISTS "adminStripeAccountId" TEXT,
ADD COLUMN IF NOT EXISTS "adminStripeAccountName" TEXT,
ADD COLUMN IF NOT EXISTS "adminStripeAccountStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "lastPlatformFeePayout" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "platformFeeBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Create PlatformFeeTransfer table
CREATE TABLE IF NOT EXISTS "PlatformFeeTransfer" (
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

-- Add platformFeeTransferred column to Order table
ALTER TABLE "Order" 
ADD COLUMN IF NOT EXISTS "platformFeeTransferred" BOOLEAN NOT NULL DEFAULT false;

-- Verify the changes by checking if columns exist
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'FinancialSettings' 
AND column_name IN ('adminStripeAccountId', 'adminStripeAccountStatus', 'platformFeeBalance');

-- Check if PlatformFeeTransfer table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'PlatformFeeTransfer'
) as table_exists;

-- Check if Order table has the new column
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'Order' 
AND column_name = 'platformFeeTransferred';
