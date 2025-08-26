import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function initializeFinancialSettings() {
  try {
    console.log('🔧 Initializing financial settings...')
    
    // Check if financial settings already exist
    const existingSettings = await prisma.financialSettings.findFirst()
    
    if (existingSettings) {
      console.log('✅ Financial settings already exist:', existingSettings)
      return
    }
    
    // Create default financial settings
    const defaultSettings = await prisma.financialSettings.create({
      data: {
        platformFee: 20, // 20% platform fee
        minimumPayout: 50, // $50 minimum payout
        payoutSchedule: "weekly", // Weekly payouts
        platformFeeBalance: 0, // Start with 0 balance
        adminStripeAccountStatus: "PENDING", // Pending admin account setup
      }
    })
    
    console.log('✅ Default financial settings created:', defaultSettings)
    
    // Also create a default PlatformFeeTransfer record if needed
    const existingTransfers = await prisma.platformFeeTransfer.findFirst()
    
    if (!existingTransfers) {
      console.log('📝 No platform fee transfers found - this is normal for new setup')
    } else {
      console.log('📊 Found existing platform fee transfers:', existingTransfers)
    }
    
  } catch (error) {
    console.error('❌ Error initializing financial settings:', error)
  } finally {
    await prisma.$disconnect()
  }
}

initializeFinancialSettings()
