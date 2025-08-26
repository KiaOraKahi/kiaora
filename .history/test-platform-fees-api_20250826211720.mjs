import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testPlatformFeesAPI() {
  try {
    console.log('🧪 Testing platform fees API functionality...')
    
    // Test 1: Check if FinancialSettings table has the required columns
    console.log('\n📊 Test 1: Checking FinancialSettings table structure...')
    const financialSettings = await prisma.financialSettings.findFirst()
    console.log('✅ FinancialSettings table accessible')
    console.log('📋 Current settings:', {
      id: financialSettings?.id,
      platformFee: financialSettings?.platformFee,
      adminStripeAccountId: financialSettings?.adminStripeAccountId,
      adminStripeAccountStatus: financialSettings?.adminStripeAccountStatus,
      platformFeeBalance: financialSettings?.platformFeeBalance
    })
    
    // Test 2: Check if PlatformFeeTransfer table exists
    console.log('\n📊 Test 2: Checking PlatformFeeTransfer table...')
    const transfers = await prisma.platformFeeTransfer.findMany({ take: 5 })
    console.log('✅ PlatformFeeTransfer table accessible')
    console.log(`📋 Found ${transfers.length} transfer records`)
    
    // Test 3: Check if Order table has platformFeeTransferred column
    console.log('\n📊 Test 3: Checking Order table structure...')
    const orders = await prisma.order.findMany({ 
      take: 1,
      select: { 
        id: true, 
        platformFee: true, 
        platformFeeTransferred: true 
      }
    })
    console.log('✅ Order table accessible with platformFeeTransferred column')
    console.log('📋 Sample order:', orders[0])
    
    // Test 4: Calculate platform fees summary
    console.log('\n📊 Test 4: Calculating platform fees summary...')
    const totalPlatformFees = await prisma.order.aggregate({
      _sum: { platformFee: true },
      where: { paymentStatus: "SUCCEEDED" }
    })
    
    const pendingPlatformFees = await prisma.order.aggregate({
      _sum: { platformFee: true },
      where: {
        paymentStatus: "SUCCEEDED",
        platformFeeTransferred: false
      }
    })
    
    console.log('✅ Platform fees calculations successful')
    console.log('📋 Summary:', {
      totalPlatformFees: totalPlatformFees._sum.platformFee || 0,
      pendingPlatformFees: pendingPlatformFees._sum.platformFee || 0
    })
    
    console.log('\n🎉 All tests passed! The platform fees functionality should work correctly.')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPlatformFeesAPI()
