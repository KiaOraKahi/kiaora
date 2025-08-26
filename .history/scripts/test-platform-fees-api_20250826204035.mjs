import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testPlatformFeesAPI() {
  try {
    console.log('🧪 Testing platform fees API logic...')
    
    // Simulate the API logic step by step
    
    // 1. Get financial settings
    console.log('1. Getting financial settings...')
    const financialSettings = await prisma.financialSettings.findFirst()
    console.log('✅ Financial settings:', financialSettings ? 'Found' : 'Not found')
    
    // 2. Get platform fee transfers
    console.log('2. Getting platform fee transfers...')
    const transfers = await prisma.platformFeeTransfer.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    console.log('✅ Transfers found:', transfers.length)
    
    // 3. Calculate total platform fees
    console.log('3. Calculating total platform fees...')
    const totalPlatformFees = await prisma.order.aggregate({
      _sum: { platformFee: true },
      where: {
        paymentStatus: "SUCCEEDED",
      },
    })
    console.log('✅ Total platform fees:', totalPlatformFees._sum.platformFee || 0)
    
    // 4. Calculate pending platform fees
    console.log('4. Calculating pending platform fees...')
    const pendingPlatformFees = await prisma.order.aggregate({
      _sum: { platformFee: true },
      where: {
        paymentStatus: "SUCCEEDED",
        platformFeeTransferred: false,
      },
    })
    console.log('✅ Pending platform fees:', pendingPlatformFees._sum.platformFee || 0)
    
    // 5. Build response
    console.log('5. Building response...')
    const response = {
      financialSettings,
      transfers,
      summary: {
        totalPlatformFees: totalPlatformFees._sum.platformFee || 0,
        pendingPlatformFees: pendingPlatformFees._sum.platformFee || 0,
        totalTransfers: transfers.length,
        successfulTransfers: transfers.filter(t => t.status === "SUCCEEDED").length,
      }
    }
    
    console.log('✅ Final response:', JSON.stringify(response, null, 2))
    
  } catch (error) {
    console.error('❌ Error in API logic:', error)
    console.error('Error details:', error.message)
    console.error('Error stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testPlatformFeesAPI()
