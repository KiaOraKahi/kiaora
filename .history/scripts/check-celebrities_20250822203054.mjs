#!/usr/bin/env node
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XNjN0WUZkZ2tPb0ljeTFveVhRaVMiLCJhcGlfa2V5IjoiMDFLMzhaOFc2VEJKQVRBWVM1M0VTNFFUMjciLCJ0ZW5hbnRfaWQiOiI5N2UxMGE4MDRiMzcxNDEzYjJhZGZhZjdhYzViMzFkMjhmY2FjYjAzZWZkNWMyOTNhYWZiYmY4NzBhYmNlN2FhIiwiaW50ZXJuYWxfc2VjcmV0IjoiZjI3ZTQyNmItZjY2NS00ZDI1LWE4OGEtM2E1NTgwMmIyODVmIn0.F7jaLciHEiq3GPE1CANg51wLP6FdxMQCYiCTHSQwdcY"
    }
  }
})

async function checkCelebrities() {
  console.log('🔍 Checking celebrities in database...\n')
  
  try {
    const celebrities = await prisma.celebrity.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log(`📊 Found ${celebrities.length} celebrities in database:\n`)

    if (celebrities.length === 0) {
      console.log('❌ No celebrities found in database!')
      console.log('💡 You need to create celebrity accounts first.')
      return
    }

    celebrities.forEach((celebrity, index) => {
      console.log(`${index + 1}. Celebrity ID: ${celebrity.id}`)
      console.log(`   User ID: ${celebrity.userId}`)
      console.log(`   Name: ${celebrity.user.name}`)
      console.log(`   Email: ${celebrity.user.email}`)
      console.log(`   Category: ${celebrity.category || 'Not set'}`)
      console.log(`   Price: $${celebrity.price || 'Not set'}`)
      console.log(`   Active: ${celebrity.isActive}`)
      console.log(`   Verified: ${celebrity.verified}`)
      console.log('')
    })

    // Also check users with CELEBRITY role
    console.log('👥 Users with CELEBRITY role:')
    const celebrityUsers = await prisma.user.findMany({
      where: { role: 'CELEBRITY' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    celebrityUsers.forEach((user, index) => {
      console.log(`${index + 1}. User ID: ${user.id}`)
      console.log(`   Name: ${user.name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error checking celebrities:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCelebrities()
