import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XNjN0WUZkZ2tPb0ljeTFveVhRaVMiLCJhcGlfa2V5IjoiMDFLMzhaOFc2VEJKQVRBWVM1M0VTNFFUMjciLCJ0ZW5hbnRfaWQiOiI5N2UxMGE4MDRiMzcxNDEzYjJhZGZhZjdhYzViMzFkMjhmY2FjYjAzZWZkNWMyOTNhYWZiYmY4NzBhYmNlN2FhIiwiaW50ZXJuYWxfc2VjcmV0IjoiZjI3ZTQyNmItZjY2NS00ZDI1LWE4OGEtM2E1NTgwMmIyODVmIn0.F7jaLciHEiq3GPE1CANg51wLP6FdxMQCYiCTHSQwdcY"
    }
  }
})

async function testAPIResponse() {
  try {
    console.log('🧪 Testing platform fees API response...')
    
    // Test the exact API logic
    console.log('📊 Getting financial settings...')
    const financialSettings = await prisma.financialSettings.findFirst()
    console.log('📋 FinancialSettings:', financialSettings)
    
    console.log('\n📊 Getting platform fee transfers...')
    const transfers = await prisma.platformFeeTransfer.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    console.log('📋 Transfers count:', transfers.length)
    
    console.log('\n📊 Calculating platform fees...')
    const totalPlatformFees = await prisma.order.aggregate({
      _sum: { platformFee: true },
      where: { paymentStatus: "SUCCEEDED" },
    })
    console.log('📋 Total platform fees:', totalPlatformFees._sum.platformFee || 0)
    
    const pendingPlatformFees = await prisma.order.aggregate({
      _sum: { platformFee: true },
      where: {
        paymentStatus: "SUCCEEDED",
        platformFeeTransferred: false,
      },
    })
    console.log('📋 Pending platform fees:', pendingPlatformFees._sum.platformFee || 0)
    
    // Simulate the API response
    const apiResponse = {
      financialSettings,
      transfers,
      summary: {
        totalPlatformFees: totalPlatformFees._sum.platformFee || 0,
        pendingPlatformFees: pendingPlatformFees._sum.platformFee || 0,
        totalTransfers: transfers.length,
        successfulTransfers: transfers.filter(t => t.status === "SUCCEEDED").length,
      }
    }
    
    console.log('\n📊 API Response Structure:')
    console.log('📋 financialSettings exists:', !!apiResponse.financialSettings)
    console.log('📋 transfers exists:', !!apiResponse.transfers)
    console.log('📋 summary exists:', !!apiResponse.summary)
    
    if (apiResponse.financialSettings) {
      console.log('📋 financialSettings.adminStripeAccountId:', apiResponse.financialSettings.adminStripeAccountId)
      console.log('📋 financialSettings.adminStripeAccountStatus:', apiResponse.financialSettings.adminStripeAccountStatus)
    }
    
    console.log('\n🎉 API response test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAPIResponse()
