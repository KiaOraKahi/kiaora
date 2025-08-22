#!/usr/bin/env node
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XNjN0WUZkZ2tPb0ljeTFveVhRaVMiLCJhcGlfa2V5IjoiMDFLMzhaOFc2VEJKQVRBWVM1M0VTNFFUMjciLCJ0ZW5hbnRfaWQiOiI5N2UxMGE4MDRiMzcxNDEzYjJhZGZhZjdhYzViMzFkMjhmY2FjYjAzZWZkNWMyOTNhYWZiYmY4NzBhYmNlN2FhIiwiaW50ZXJuYWxfc2VjcmV0IjoiZjI3ZTQyNmItZjY2NS00ZDI1LWE4OGEtM2E1NTgwMmIyODVmIn0.F7jaLciHEiq3GPE1CANg51wLP6FdxMQCYiCTHSQwdcY"
    }
  }
})

async function testCelebrityAPI() {
  console.log('🧪 Testing Celebrity API...\n')
  
  try {
    // Find the celebrity
    const celebrity = await prisma.celebrity.findFirst({
      where: {
        user: {
          email: 'sarahcelebrity@example.com'
        }
      },
      include: {
        user: true
      }
    })

    if (!celebrity) {
      console.log('❌ Celebrity not found!')
      return
    }

    console.log(`📝 Celebrity found:`)
    console.log(`   - Celebrity ID: ${celebrity.id}`)
    console.log(`   - User ID: ${celebrity.userId}`)
    console.log(`   - Name: ${celebrity.user.name}`)
    console.log(`   - Email: ${celebrity.user.email}`)
    console.log(`   - Active: ${celebrity.isActive}`)
    console.log(`   - Verified: ${celebrity.verified}`)
    console.log('')

    // Test the API endpoint
    console.log('🌐 Testing API endpoint...')
    const apiUrl = `https://kia-ora-kahi.vercel.app/api/celebrities/${celebrity.id}`
    console.log(`   URL: ${apiUrl}`)
    
    try {
      const response = await fetch(apiUrl)
      const data = await response.json()
      
      console.log(`   Status: ${response.status}`)
      if (response.ok) {
        console.log('   ✅ API Response:')
        console.log(`      - ID: ${data.id}`)
        console.log(`      - Name: ${data.name}`)
        console.log(`      - Category: ${data.category}`)
        console.log(`      - Price: $${data.price}`)
        console.log(`      - Active: ${data.verified}`)
      } else {
        console.log('   ❌ API Error:', data.error)
      }
    } catch (apiError) {
      console.log('   ❌ API Request Failed:', apiError.message)
    }

    console.log('\n🔗 To test the payment flow:')
    console.log(`   1. Go to: https://kia-ora-kahi.vercel.app/celebrities/${celebrity.id}`)
    console.log(`   2. Click "Book Now"`)
    console.log(`   3. Fill the form and click "Proceed to Payment"`)

  } catch (error) {
    console.error('❌ Error testing celebrity API:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCelebrityAPI()
