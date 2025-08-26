import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixProductionDatabase() {
  try {
    console.log('🔧 Fixing production database schema...')
    
    // Step 1: Add missing columns to FinancialSettings table
    console.log('📊 Adding missing columns to FinancialSettings table...')
    
    try {
      await prisma.$executeRaw`
        ALTER TABLE "FinancialSettings" 
        ADD COLUMN IF NOT EXISTS "adminStripeAccountEmail" TEXT,
        ADD COLUMN IF NOT EXISTS "adminStripeAccountId" TEXT,
        ADD COLUMN IF NOT EXISTS "adminStripeAccountName" TEXT,
        ADD COLUMN IF NOT EXISTS "adminStripeAccountStatus" TEXT NOT NULL DEFAULT 'PENDING',
        ADD COLUMN IF NOT EXISTS "lastPlatformFeePayout" TIMESTAMP(3),
        ADD COLUMN IF NOT EXISTS "platformFeeBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;
      `
      console.log('✅ FinancialSettings columns added successfully')
    } catch (error) {
      console.error('❌ Error adding FinancialSettings columns:', error.message)
    }
    
    // Step 2: Create PlatformFeeTransfer table
    console.log('📊 Creating PlatformFeeTransfer table...')
    try {
      await prisma.$executeRaw`
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
      `
      console.log('✅ PlatformFeeTransfer table created successfully')
    } catch (error) {
      console.error('❌ Error creating PlatformFeeTransfer table:', error.message)
    }
    
    // Step 3: Add platformFeeTransferred column to Order table
    console.log('📊 Adding platformFeeTransferred column to Order table...')
    try {
      await prisma.$executeRaw`
        ALTER TABLE "Order" 
        ADD COLUMN IF NOT EXISTS "platformFeeTransferred" BOOLEAN NOT NULL DEFAULT false;
      `
      console.log('✅ Order table column added successfully')
    } catch (error) {
      console.error('❌ Error adding Order table column:', error.message)
    }
    
    // Step 4: Verify the changes
    console.log('🔍 Verifying database changes...')
    
    try {
      const financialSettings = await prisma.financialSettings.findFirst()
      console.log('✅ FinancialSettings table accessible with new columns')
      console.log('📋 Current settings:', {
        id: financialSettings?.id,
        platformFee: financialSettings?.platformFee,
        adminStripeAccountId: financialSettings?.adminStripeAccountId,
        adminStripeAccountStatus: financialSettings?.adminStripeAccountStatus,
        platformFeeBalance: financialSettings?.platformFeeBalance
      })
      
      const transfers = await prisma.platformFeeTransfer.findMany({ take: 1 })
      console.log('✅ PlatformFeeTransfer table accessible')
      console.log(`📋 Found ${transfers.length} transfer records`)
      
      const orders = await prisma.order.findMany({ 
        take: 1,
        select: { platformFeeTransferred: true }
      })
      console.log('✅ Order table accessible with platformFeeTransferred column')
      
      console.log('🎉 All database changes applied successfully!')
      console.log('📝 The platform fees functionality should now work correctly.')
      
    } catch (error) {
      console.error('❌ Error verifying changes:', error.message)
    }
    
  } catch (error) {
    console.error('❌ Error fixing production database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixProductionDatabase()
