import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testPlatformFees() {
  try {
    console.log('🧪 Testing platform fees functionality...')
    
    // Test the exact query that was failing
    const financialSettings = await prisma.financialSettings.findFirst()
    console.log('✅ FinancialSettings query successful')
    console.log('📋 Settings:', {
      id: financialSettings?.id,
      platformFee: financialSettings?.platformFee,
      adminStripeAccountId: financialSettings?.adminStripeAccountId,
      adminStripeAccountStatus: financialSettings?.adminStripeAccountStatus,
      platformFeeBalance: financialSettings?.platformFeeBalance
    })
    
    // Test platform fee transfers
    const transfers = await prisma.platformFeeTransfer.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    console.log('✅ PlatformFeeTransfer query successful')
    console.log(`📋 Found ${transfers.length} transfers`)
    
    // Test platform fees calculation
    const totalPlatformFees = await prisma.order.aggregate({
      _sum: { platformFee: true },
      where: { paymentStatus: "SUCCEEDED" },
    })
    console.log('✅ Platform fees calculation successful')
    console.log('📋 Total platform fees:', totalPlatformFees._sum.platformFee || 0)
    
    // Test pending platform fees
    const pendingPlatformFees = await prisma.order.aggregate({
      _sum: { platformFee: true },
      where: {
        paymentStatus: "SUCCEEDED",
        platformFeeTransferred: false,
      },
    })
    console.log('✅ Pending platform fees calculation successful')
    console.log('📋 Pending platform fees:', pendingPlatformFees._sum.platformFee || 0)
    
    console.log('\n🎉 All platform fees functionality tests passed!')
    console.log('📝 The API should now work correctly without the adminStripeAccountId error.')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPlatformFees()
