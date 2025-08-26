import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    console.log('🔧 Starting database schema fix...')
    
    // Add missing columns to FinancialSettings table
    console.log('📊 Adding missing columns to FinancialSettings table...')
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

    // Create PlatformFeeTransfer table
    console.log('📊 Creating PlatformFeeTransfer table...')
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

    // Add platformFeeTransferred column to Order table
    console.log('📊 Adding platformFeeTransferred column to Order table...')
    await prisma.$executeRaw`
      ALTER TABLE "Order" 
      ADD COLUMN IF NOT EXISTS "platformFeeTransferred" BOOLEAN NOT NULL DEFAULT false;
    `
    console.log('✅ Order table column added successfully')

    // Verify the changes
    console.log('🔍 Verifying database changes...')
    
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

    return NextResponse.json({ 
      success: true, 
      message: 'Database schema updated successfully',
      details: {
        financialSettings: 'Updated with admin Stripe account columns',
        platformFeeTransfer: 'Table created successfully',
        orderTable: 'Updated with platformFeeTransferred column'
      }
    })
  } catch (error) {
    console.error('❌ Database fix error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Check server logs for more information'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
