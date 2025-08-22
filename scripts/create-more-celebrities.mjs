#!/usr/bin/env node
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XNjN0WUZkZ2tPb0ljeTFveVhRaVMiLCJhcGlfa2V5IjoiMDFLMzhaOFc2VEJKQVRBWVM1M0VTNFFUMjciLCJ0ZW5hbnRfaWQiOiI5N2UxMGE4MDRiMzcxNDEzYjJhZGZhZjdhYzViMzFkMjhmY2FjYjAzZWZkNWMyOTNhYWZiYmY4NzBhYmNlN2FhIiwiaW50ZXJuYWxfc2VjcmV0IjoiZjI3ZTQyNmItZjY2NS00ZDI1LWE4OGEtM2E1NTgwMmIyODVmIn0.F7jaLciHEiq3GPE1CANg51wLP6FdxMQCYiCTHSQwdcY"
    }
  }
})

async function createMoreCelebrities() {
  console.log('🔧 Creating more celebrity profiles...\n')
  
  try {
    const celebrities = [
      {
        name: "Emma Stone",
        email: "emma.stone@example.com",
        password: "EmmaPass123!",
        bio: "Academy Award-winning actress known for her versatile performances in comedy and drama. Perfect for personalized birthday messages and special occasions.",
        longBio: "Emma Stone is an Academy Award-winning actress known for her incredible range and versatility. From comedies to dramas, she brings authenticity and charm to every role. Her warm personality makes her perfect for creating heartfelt video messages.",
        category: "Actor",
        price: 299,
        rating: 4.9,
        averageRating: 4.9,
        totalReviews: 0,
        completionRate: 95,
        responseTime: "24 hours",
        isActive: true,
        verified: true,
        featured: true,
        tags: ["Hollywood", "Award Winner", "Comedy", "Drama"],
        achievements: ["Academy Award Winner", "Versatile Actress", "Fan Favorite"],
        nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        image: "/celeb1.jpg",
        coverImage: "/celeb1.jpg"
      },
      {
        name: "John Legend",
        email: "john.legend@example.com",
        password: "JohnPass123!",
        bio: "Grammy-winning singer-songwriter and pianist. Creates heartfelt, soulful video messages perfect for romantic occasions and celebrations.",
        longBio: "John Legend is a Grammy-winning singer-songwriter and pianist known for his soulful voice and romantic ballads. His music has touched millions of hearts worldwide, and he brings that same warmth to his personalized video messages.",
        category: "Musician",
        price: 599,
        rating: 5.0,
        averageRating: 5.0,
        totalReviews: 0,
        completionRate: 98,
        responseTime: "48 hours",
        isActive: true,
        verified: true,
        featured: true,
        tags: ["Grammy Winner", "Soul", "Piano", "Romantic"],
        achievements: ["Grammy Award Winner", "Soul Music Icon", "Romantic Ballads"],
        nextAvailable: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        image: "/celeb2.jpg",
        coverImage: "/celeb2.jpg"
      },
      {
        name: "Tony Robbins",
        email: "tony.robbins@example.com",
        password: "TonyPass123!",
        bio: "World-renowned life coach and motivational speaker. Inspires with powerful messages for business success and personal development.",
        longBio: "Tony Robbins is a world-renowned life coach and motivational speaker who has helped millions of people achieve their goals. His powerful messages inspire personal and professional success.",
        category: "Motivator",
        price: 899,
        rating: 4.8,
        averageRating: 4.8,
        totalReviews: 0,
        completionRate: 92,
        responseTime: "72 hours",
        isActive: true,
        verified: true,
        featured: true,
        tags: ["Motivation", "Business", "Leadership", "Success"],
        achievements: ["Life Coach", "Motivational Speaker", "Business Success"],
        nextAvailable: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        image: "/celeb3.jpg",
        coverImage: "/celeb3.jpg"
      },
      {
        name: "MrBeast",
        email: "mrbeast@example.com",
        password: "BeastPass123!",
        bio: "YouTube sensation and philanthropist. Creates energetic, fun video messages perfect for younger audiences and special events.",
        longBio: "MrBeast is a YouTube sensation and philanthropist known for his incredible generosity and entertaining content. His energetic personality makes him perfect for creating fun and engaging video messages.",
        category: "Influencer",
        price: 1299,
        rating: 4.9,
        averageRating: 4.9,
        totalReviews: 0,
        completionRate: 96,
        responseTime: "1 week",
        isActive: true,
        verified: true,
        featured: true,
        tags: ["YouTube", "Philanthropy", "Entertainment", "Gaming"],
        achievements: ["YouTube Star", "Philanthropist", "Entertainment Icon"],
        nextAvailable: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        image: "/talents/1.jpeg",
        coverImage: "/talents/1.jpeg"
      },
      {
        name: "Oprah Winfrey",
        email: "oprah@example.com",
        password: "OprahPass123!",
        bio: "Media mogul and inspirational speaker. Delivers powerful, meaningful messages for life milestones and personal growth.",
        longBio: "Oprah Winfrey is a media mogul and inspirational speaker who has touched millions of lives through her television show and philanthropic work. Her wisdom and compassion shine through in every message.",
        category: "Motivator",
        price: 1999,
        rating: 5.0,
        averageRating: 5.0,
        totalReviews: 0,
        completionRate: 90,
        responseTime: "2 weeks",
        isActive: true,
        verified: true,
        featured: true,
        tags: ["Media", "Inspiration", "Life Coach", "Empowerment"],
        achievements: ["Media Mogul", "Inspirational Speaker", "Philanthropist"],
        nextAvailable: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        image: "/talents/2.jpg",
        coverImage: "/talents/2.jpg"
      }
    ]

    for (const celebData of celebrities) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: celebData.email }
      })

      if (existingUser) {
        console.log(`⚠️ User ${celebData.name} already exists, skipping...`)
        continue
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(celebData.password, 12)

      // Create user
      const user = await prisma.user.create({
        data: {
          name: celebData.name,
          email: celebData.email,
          password: hashedPassword,
          role: "CELEBRITY",
          isVerified: true,
          image: celebData.image
        }
      })

      // Create celebrity profile
      const celebrity = await prisma.celebrity.create({
        data: {
          userId: user.id,
          bio: celebData.bio,
          longBio: celebData.longBio,
          category: celebData.category,
          price: celebData.price,
          rating: celebData.rating,
          averageRating: celebData.averageRating,
          totalReviews: celebData.totalReviews,
          completionRate: celebData.completionRate,
          responseTime: celebData.responseTime,
          isActive: celebData.isActive,
          verified: celebData.verified,
          featured: celebData.featured,
          tags: celebData.tags,
          achievements: celebData.achievements,
          nextAvailable: celebData.nextAvailable,
          coverImage: celebData.coverImage
        }
      })

      console.log(`✅ Created celebrity: ${celebData.name} (ID: ${celebrity.id})`)
    }

    console.log('\n🎉 All celebrities created successfully!')

  } catch (error) {
    console.error('❌ Error creating celebrities:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createMoreCelebrities()
