import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function applyProductionMigrations() {
  try {
    console.log('🚀 Applying migrations to production database...')
    
    // Check if FinancialSettings table has the required columns
    console.log('📊 Checking FinancialSettings table structure...')
    
    try {
      const financialSettings = await prisma.financialSettings.findFirst()
      console.log('✅ FinancialSettings table exists')
      
      // Try to access the new columns to see if they exist
      if (financialSettings) {
        console.log('📋 Current FinancialSettings:', {
          id: financialSettings.id,
          platformFee: financialSettings.platformFee,
          minimumPayout: financialSettings.minimumPayout,
          payoutSchedule: financialSettings.payoutSchedule,
          // These should exist if migrations were applied
          adminStripeAccountId: financialSettings.adminStripeAccountId,
          adminStripeAccountStatus: financialSettings.adminStripeAccountStatus,
          platformFeeBalance: financialSettings.platformFeeBalance,
        })
      }
    } catch (error) {
      console.error('❌ Error accessing FinancialSettings:', error.message)
      
      if (error.message.includes('adminStripeAccountId')) {
        console.log('🔧 Missing columns detected. Need to apply migrations.')
        console.log('📝 Please run the following SQL commands on your production database:')
        console.log(`
-- Add missing columns to FinancialSettings table
ALTER TABLE "FinancialSettings" ADD COLUMN IF NOT EXISTS "adminStripeAccountEmail" TEXT;
ALTER TABLE "FinancialSettings" ADD COLUMN IF NOT EXISTS "adminStripeAccountId" TEXT;
ALTER TABLE "FinancialSettings" ADD COLUMN IF NOT EXISTS "adminStripeAccountName" TEXT;
ALTER TABLE "FinancialSettings" ADD COLUMN IF NOT EXISTS "adminStripeAccountStatus" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "FinancialSettings" ADD COLUMN IF NOT EXISTS "lastPlatformFeePayout" TIMESTAMP(3);
ALTER TABLE "FinancialSettings" ADD COLUMN IF NOT EXISTS "platformFeeBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;

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
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "platformFeeTransferred" BOOLEAN NOT NULL DEFAULT false;
        `)
      }
    }
    
    // Check if PlatformFeeTransfer table exists
    try {
      const transfers = await prisma.platformFeeTransfer.findMany({ take: 1 })
      console.log('✅ PlatformFeeTransfer table exists')
    } catch (error) {
      console.error('❌ PlatformFeeTransfer table missing:', error.message)
    }
    
    // Check if Order table has platformFeeTransferred column
    try {
      const orders = await prisma.order.findMany({ 
        take: 1,
        select: { platformFeeTransferred: true }
      })
      console.log('✅ Order table has platformFeeTransferred column')
    } catch (error) {
      console.error('❌ Order table missing platformFeeTransferred column:', error.message)
    }
    
    console.log('✅ Migration check completed')
    
  } catch (error) {
    console.error('❌ Error during migration check:', error)
  } finally {
    await prisma.$disconnect()
  }
}

applyProductionMigrations()
