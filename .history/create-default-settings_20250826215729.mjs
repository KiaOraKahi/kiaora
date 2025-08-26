import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XNjN0WUZkZ2tPb0ljeTFveVhRaVMiLCJhcGlfa2V5IjoiMDFLMzhaOFc2VEJKQVRBWVM1M0VTNFFUMjciLCJ0ZW5hbnRfaWQiOiI5N2UxMGE4MDRiMzcxNDEzYjJhZGZhZjdhYzViMzFkMjhmY2FjYjAzZWZkNWMyOTNhYWZiYmY4NzBhYmNlN2FhIiwiaW50ZXJuYWxfc2VjcmV0IjoiZjI3ZTQyNmItZjY2NS00ZDI1LWE4OGEtM2E1NTgwMmIyODVmIn0.F7jaLciHEiq3GPE1CANg51wLP6FdxMQCYiCTHSQwdcY"
    }
  }
})

async function createDefaultSettings() {
  try {
    console.log('🔧 Creating default FinancialSettings record...')
    
    // Check if FinancialSettings record exists
    const existingSettings = await prisma.financialSettings.findFirst()
    
    if (existingSettings) {
      console.log('✅ FinancialSettings record already exists')
      console.log('📋 Current settings:', {
        id: existingSettings.id,
        platformFee: existingSettings.platformFee,
        adminStripeAccountId: existingSettings.adminStripeAccountId,
        adminStripeAccountStatus: existingSettings.adminStripeAccountStatus,
        platformFeeBalance: existingSettings.platformFeeBalance
      })
    } else {
      console.log('📊 Creating default FinancialSettings record...')
      
      const defaultSettings = await prisma.financialSettings.create({
        data: {
          platformFee: 20,
          minimumPayout: 50,
          payoutSchedule: "weekly",
          adminStripeAccountStatus: "PENDING",
          platformFeeBalance: 0,
        }
      })
      
      console.log('✅ Default FinancialSettings record created successfully')
      console.log('📋 New settings:', {
        id: defaultSettings.id,
        platformFee: defaultSettings.platformFee,
        adminStripeAccountId: defaultSettings.adminStripeAccountId,
        adminStripeAccountStatus: defaultSettings.adminStripeAccountStatus,
        platformFeeBalance: defaultSettings.platformFeeBalance
      })
    }
    
    // Verify the API response now works
    console.log('\n🔍 Verifying API response...')
    const financialSettings = await prisma.financialSettings.findFirst()
    const transfers = await prisma.platformFeeTransfer.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    
    const totalPlatformFees = await prisma.order.aggregate({
      _sum: { platformFee: true },
      where: { paymentStatus: "SUCCEEDED" },
    })
    
    const pendingPlatformFees = await prisma.order.aggregate({
      _sum: { platformFee: true },
      where: {
        paymentStatus: "SUCCEEDED",
        platformFeeTransferred: false,
      },
    })
    
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
    
    console.log('📊 API Response Structure:')
    console.log('📋 financialSettings exists:', !!apiResponse.financialSettings)
    console.log('📋 transfers exists:', !!apiResponse.transfers)
    console.log('📋 summary exists:', !!apiResponse.summary)
    
    if (apiResponse.financialSettings) {
      console.log('📋 financialSettings.adminStripeAccountId:', apiResponse.financialSettings.adminStripeAccountId)
      console.log('📋 financialSettings.adminStripeAccountStatus:', apiResponse.financialSettings.adminStripeAccountStatus)
    }
    
    console.log('\n🎉 Default settings setup completed!')
    console.log('📝 The platform fees page should now load without errors.')
    
  } catch (error) {
    console.error('❌ Error creating default settings:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDefaultSettings()
