import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixProductionDatabase() {
  try {
    console.log('🔧 Fixing production database schema...')
    
    // Apply the missing migrations manually
    console.log('📊 Adding missing columns to FinancialSettings table...')
    
    try {
      // Add missing columns to FinancialSettings table
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
    
    console.log('📊 Creating PlatformFeeTransfer table...')
    try {
      // Create PlatformFeeTransfer table
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
    
    console.log('📊 Adding platformFeeTransferred column to Order table...')
    try {
      // Add platformFeeTransferred column to Order table
      await prisma.$executeRaw`
        ALTER TABLE "Order" 
        ADD COLUMN IF NOT EXISTS "platformFeeTransferred" BOOLEAN NOT NULL DEFAULT false;
      `
      console.log('✅ Order table column added successfully')
    } catch (error) {
      console.error('❌ Error adding Order table column:', error.message)
    }
    
    // Verify the changes
    console.log('🔍 Verifying database changes...')
    
    try {
      const financialSettings = await prisma.financialSettings.findFirst()
      console.log('✅ FinancialSettings table accessible with new columns')
      
      const transfers = await prisma.platformFeeTransfer.findMany({ take: 1 })
      console.log('✅ PlatformFeeTransfer table accessible')
      
      const orders = await prisma.order.findMany({ 
        take: 1,
        select: { platformFeeTransferred: true }
      })
      console.log('✅ Order table accessible with platformFeeTransferred column')
      
      console.log('🎉 All database changes applied successfully!')
      console.log('📝 The admin platform fees functionality should now work correctly.')
      
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
