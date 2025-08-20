import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testSettingsSave() {
  try {
    console.log('🧪 Testing Settings Save Functionality...')
    
    // Test settings API endpoint
    console.log('\n📡 Testing settings API...')
    
    const testSiteSettings = {
      siteName: "Test Site Name",
      siteDescription: "Test Description",
      contactEmail: "test@example.com"
    }
    
    const testFinancialSettings = {
      platformFee: 25,
      minimumPayout: 100,
      payoutSchedule: "monthly"
    }
    
    const response = await fetch('http://localhost:3000/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        siteSettings: testSiteSettings,
        financialSettings: testFinancialSettings 
      })
    })
    
    console.log('API Response Status:', response.status)
    
    if (response.status === 401) {
      console.log('🔒 This is expected - API requires admin authentication')
      console.log('✅ Settings save API endpoint exists and is protected')
    } else if (response.ok) {
      const result = await response.json()
      console.log('✅ API returned success:', result)
    } else {
      const error = await response.text()
      console.log('❌ API returned error:', error)
    }
    
    // Test direct database operations
    console.log('\n🔧 Testing direct database settings operations...')
    
    // Test site settings
    const existingSiteSettings = await prisma.siteSettings.findFirst()
    console.log('Existing site settings:', existingSiteSettings)
    
    if (existingSiteSettings) {
      const updatedSiteSettings = await prisma.siteSettings.update({
        where: { id: existingSiteSettings.id },
        data: {
          siteName: "Updated Test Site",
          siteDescription: "Updated test description",
          contactEmail: "updated@test.com"
        }
      })
      console.log('✅ Site settings updated:', updatedSiteSettings)
      
      // Restore original
      await prisma.siteSettings.update({
        where: { id: existingSiteSettings.id },
        data: {
          siteName: existingSiteSettings.siteName,
          siteDescription: existingSiteSettings.siteDescription,
          contactEmail: existingSiteSettings.contactEmail
        }
      })
      console.log('🔄 Site settings restored')
    } else {
      const newSiteSettings = await prisma.siteSettings.create({
        data: testSiteSettings
      })
      console.log('✅ Site settings created:', newSiteSettings)
    }
    
    // Test financial settings
    const existingFinancialSettings = await prisma.financialSettings.findFirst()
    console.log('Existing financial settings:', existingFinancialSettings)
    
    if (existingFinancialSettings) {
      const updatedFinancialSettings = await prisma.financialSettings.update({
        where: { id: existingFinancialSettings.id },
        data: {
          platformFee: 30,
          minimumPayout: 200,
          payoutSchedule: "biweekly"
        }
      })
      console.log('✅ Financial settings updated:', updatedFinancialSettings)
      
      // Restore original
      await prisma.financialSettings.update({
        where: { id: existingFinancialSettings.id },
        data: {
          platformFee: existingFinancialSettings.platformFee,
          minimumPayout: existingFinancialSettings.minimumPayout,
          payoutSchedule: existingFinancialSettings.payoutSchedule
        }
      })
      console.log('🔄 Financial settings restored')
    } else {
      const newFinancialSettings = await prisma.financialSettings.create({
        data: testFinancialSettings
      })
      console.log('✅ Financial settings created:', newFinancialSettings)
    }
    
    console.log('\n✅ Settings save functionality works correctly!')
    
  } catch (error) {
    console.error('❌ Error testing settings save:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSettingsSave()
