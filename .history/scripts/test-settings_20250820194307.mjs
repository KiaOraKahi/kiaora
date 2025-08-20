import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testSettings() {
  try {
    console.log('🧪 Testing Settings Functionality...')
    
    // Test creating site settings
    console.log('\n📝 Creating site settings...')
    const siteSettings = await prisma.siteSettings.create({
      data: {
        siteName: "Kia Ora Kahi",
        siteDescription: "Connect with celebrities for personalized video messages",
        contactEmail: "admin@kiaora.com"
      }
    })
    console.log('✅ Site settings created:', siteSettings)
    
    // Test creating financial settings
    console.log('\n💰 Creating financial settings...')
    const financialSettings = await prisma.financialSettings.create({
      data: {
        platformFee: 20,
        minimumPayout: 50,
        payoutSchedule: "weekly"
      }
    })
    console.log('✅ Financial settings created:', financialSettings)
    
    // Test fetching settings
    console.log('\n📖 Fetching settings...')
    const allSiteSettings = await prisma.siteSettings.findMany()
    const allFinancialSettings = await prisma.financialSettings.findMany()
    console.log('✅ Site settings found:', allSiteSettings.length)
    console.log('✅ Financial settings found:', allFinancialSettings.length)
    
    console.log('\n🎉 Settings functionality test completed successfully!')
    
  } catch (error) {
    console.error('❌ Error testing settings:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSettings()
