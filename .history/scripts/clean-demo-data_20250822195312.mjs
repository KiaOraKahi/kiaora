#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'

// Production database client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XNjN0WUZkZ2tPb0ljeTFveVhRaVMiLCJhcGlfa2V5IjoiMDFLMzhaOFc2VEJKQVRBWVM1M0VTNFFUMjciLCJ0ZW5hbnRfaWQiOiI5N2UxMGE4MDRiMzcxNDEzYjJhZGZhZjdhYzViMzFkMjhmY2FjYjAzZWZkNWMyOTNhYWZiYmY4NzBhYmNlN2FhIiwiaW50ZXJuYWxfc2VjcmV0IjoiZjI3ZTQyNmItZjY2NS00ZDI1LWE4OGEtM2E1NTgwMmIyODVmIn0.F7jaLciHEiq3GPE1CANg51wLP6FdxMQCYiCTHSQwdcY"
    }
  }
})

async function cleanDemoData() {
  console.log('🧹 Cleaning Demo Data...\n')

  try {
    // Get all users
    const users = await prisma.user.findMany()
    console.log(`Found ${users.length} users to clean`)

    // Clean each user's demo data
    for (const user of users) {
      console.log(`\n🧹 Cleaning user: ${user.name} (${user.email})`)
      
      // Update user to remove demo data
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: user.name === "testaccount" ? "User" : user.name,
          image: null, // Remove demo profile image
          // Keep email, password, role, verification status
        }
      })

      // If it's a celebrity, clean celebrity profile
      if (user.role === "CELEBRITY") {
        const celebrity = await prisma.celebrity.findUnique({
          where: { userId: user.id }
        })

        if (celebrity) {
          await prisma.celebrity.update({
            where: { userId: user.id },
            data: {
              bio: null,
              longBio: null,
              category: null,
              price: null,
              rating: null,
              averageRating: null,
              totalReviews: 0,
              completionRate: 0,
              responseTime: null,
              isActive: false,
              verified: false,
              featured: false,
              coverImage: null,
              tags: [],
              achievements: [],
              nextAvailable: null
            }
          })
          console.log(`   ✅ Cleaned celebrity profile`)
        }
      }

      console.log(`   ✅ Cleaned user data`)
    }

    // Clean other demo data
    console.log('\n🧹 Cleaning other demo data...')
    
    // Remove demo orders
    const deletedOrders = await prisma.order.deleteMany({})
    console.log(`   ✅ Removed ${deletedOrders.count} demo orders`)

    // Remove demo reviews
    const deletedReviews = await prisma.review.deleteMany({})
    console.log(`   ✅ Removed ${deletedReviews.count} demo reviews`)

    // Remove demo tips
    const deletedTips = await prisma.tip.deleteMany({})
    console.log(`   ✅ Removed ${deletedTips.count} demo tips`)

    // Remove demo services
    const deletedServices = await prisma.service.deleteMany({})
    console.log(`   ✅ Removed ${deletedServices.count} demo services`)

    console.log('\n🎉 Demo data cleaning completed!')
    console.log('\n📋 Clean accounts ready for real use:')
    
    const cleanUsers = await prisma.user.findMany()
    cleanUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role}`)
    })

  } catch (error) {
    console.error('❌ Error cleaning demo data:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
cleanDemoData()
