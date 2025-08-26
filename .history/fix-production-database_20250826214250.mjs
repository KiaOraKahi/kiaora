import { PrismaClient } from '@prisma/client'

// Use production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_PRISMA_DATABASE_URL || "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XNjN0WUZkZ2tPb0ljeTFveVhRaVMiLCJhcGlfa2V5IjoiMDFLMzhaOFc2VEJKQVRBWVM1M0VTNFFUMjciLCJ0ZW5hbnRfaWQiOiI5N2UxMGE4MDRiMzcxNDEzYjJhZGZhZjdhYzViMzFkMjhmY2FjYjAzZWZkNWMyOTNhYWZiYmY4NzBhYmNlN2FhIiwiaW50ZXJuYWxfc2VjcmV0IjoiZjI3ZTQyNmItZjY2NS00ZDI1LWE4OGEtM2E1NTgwMmIyODVmIn0.F7jaLciHEiq3GPE1CANg51wLP6FdxMQCYiCTHSQwdcY"
    }
  }
})

async function fixProductionDatabase() {
  try {
    console.log('🔧 Fixing production database schema...')
    console.log('📊 Using production database URL')
    
    // Step 1: Add missing columns to FinancialSettings table
    console.log('📊 Step 1: Adding missing columns to FinancialSettings table...')
    
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
    console.log('📊 Step 2: Creating PlatformFeeTransfer table...')
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
    console.log('📊 Step 3: Adding platformFeeTransferred column to Order table...')
    try {
      await prisma.$executeRaw`
        ALTER TABLE "Order" 
        ADD COLUMN IF NOT EXISTS "platformFeeTransferred" BOOLEAN NOT NULL DEFAULT false;
      `
      console.log('✅ Order table platformFeeTransferred column added successfully')
    } catch (error) {
      console.error('❌ Error adding Order table column:', error.message)
    }
    
    // Step 4: Verify all tables and columns exist
    console.log('🔍 Step 4: Verifying all database changes...')
    
    try {
      // Test FinancialSettings
      const financialSettings = await prisma.financialSettings.findFirst()
      console.log('✅ FinancialSettings table accessible with new columns')
      console.log('📋 Settings:', {
        id: financialSettings?.id,
        platformFee: financialSettings?.platformFee,
        adminStripeAccountId: financialSettings?.adminStripeAccountId,
        adminStripeAccountStatus: financialSettings?.adminStripeAccountStatus,
        platformFeeBalance: financialSettings?.platformFeeBalance
      })
      
      // Test PlatformFeeTransfer
      const transfers = await prisma.platformFeeTransfer.findMany({ take: 1 })
      console.log('✅ PlatformFeeTransfer table accessible')
      console.log(`📋 Found ${transfers.length} transfer records`)
      
      // Test Order table with platformFeeTransferred
      const orders = await prisma.order.findMany({ 
        take: 1,
        select: { 
          id: true,
          orderNumber: true,
          platformFeeTransferred: true 
        }
      })
      console.log('✅ Order table accessible with platformFeeTransferred column')
      console.log('📋 Sample order:', orders[0])
      
      // Test admin bookings query specifically
      console.log('🔍 Testing admin bookings query...')
      const adminBookings = await prisma.order.findMany({
        take: 1,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          celebrity: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                }
              }
            }
          },
          booking: {
            select: {
              id: true,
              status: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
      })
      console.log('✅ Admin bookings query successful')
      console.log(`📋 Found ${adminBookings.length} bookings`)
      
      console.log('\n🎉 All database changes applied and verified successfully!')
      console.log('📝 The admin bookings and platform fees functionality should now work correctly.')
      
    } catch (error) {
      console.error('❌ Error verifying changes:', error.message)
      console.error('Full error:', error)
    }
    
  } catch (error) {
    console.error('❌ Error fixing production database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixProductionDatabase()
