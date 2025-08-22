#!/usr/bin/env node
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XNjN0WUZkZ2tPb0ljeTFveVhRaVMiLCJhcGlfa2V5IjoiMDFLMzhaOFc2VEJKQVRBWVM1M0VTNFFUMjciLCJ0ZW5hbnRfaWQiOiI5N2UxMGE4MDRiMzcxNDEzYjJhZGZhZjdhYzViMzFkMjhmY2FjYjAzZWZkNWMyOTNhYWZiYmY4NzBhYmNlN2FhIiwiaW50ZXJuYWxfc2VjcmV0IjoiZjI3ZTQyNmItZjY2NS00ZDI1LWE4OGEtM2E1NTgwMmIyODVmIn0.F7jaLciHEiq3GPE1CANg51wLP6FdxMQCYiCTHSQwdcY"
    }
  }
})

async function fixCelebrityProfile() {
  console.log('🔧 Fixing celebrity profile...\n')
  
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

    console.log(`📝 Found celebrity: ${celebrity.user.name} (ID: ${celebrity.id})`)

    // Update the celebrity profile with proper data
    const updatedCelebrity = await prisma.celebrity.update({
      where: { id: celebrity.id },
      data: {
        bio: "Professional actress and entertainer with years of experience in the industry. I love creating personalized video messages for fans!",
        longBio: "Sarah Celebrity is a talented actress and entertainer who has been in the industry for over 10 years. She has appeared in numerous films and TV shows, and loves connecting with fans through personalized video messages. Her warm personality and professional approach make her a favorite among fans worldwide.",
        category: "Actor",
        price: 299,
        rating: 4.8,
        averageRating: 4.8,
        totalReviews: 0,
        completionRate: 95,
        responseTime: "24 hours",
        isActive: true,
        verified: true,
        featured: true,
        tags: ["Actor", "Entertainment", "Personal Messages", "Professional"],
        achievements: ["Award-winning actress", "10+ years in industry", "Fan favorite"],
        nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Available tomorrow
        coverImage: "/celeb2.jpg"
      }
    })

    console.log('✅ Celebrity profile updated successfully!')
    console.log(`   - Category: ${updatedCelebrity.category}`)
    console.log(`   - Price: $${updatedCelebrity.price}`)
    console.log(`   - Active: ${updatedCelebrity.isActive}`)
    console.log(`   - Verified: ${updatedCelebrity.verified}`)
    console.log(`   - Featured: ${updatedCelebrity.featured}`)

    // Also update the user's image
    await prisma.user.update({
      where: { id: celebrity.userId },
      data: {
        image: "/celeb2.jpg"
      }
    })

    console.log('✅ User image updated!')

  } catch (error) {
    console.error('❌ Error fixing celebrity profile:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixCelebrityProfile()
