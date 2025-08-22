#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Production database client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XNjN0WUZkZ2tPb0ljeTFveVhRaVMiLCJhcGlfa2V5IjoiMDFLMzhaOFc2VEJKQVRBWVM1M0VTNFFUMjciLCJ0ZW5hbnRfaWQiOiI5N2UxMGE4MDRiMzcxNDEzYjJhZGZhZjdhYzViMzFkMjhmY2FjYjAzZWZkNWMyOTNhYWZiYmY4NzBhYmNlN2FhIiwiaW50ZXJuYWxfc2VjcmV0IjoiZjI3ZTQyNmItZjY2NS00ZDI1LWE4OGEtM2E1NTgwMmIyODVmIn0.F7jaLciHEiq3GPE1CANg51wLP6FdxMQCYiCTHSQwdcY"
    }
  }
})

async function createCelebrityAccount() {
  console.log('⭐ Creating Celebrity Account...\n')

  try {
    // Celebrity account details
    const celebrityData = {
      name: "Sarah Celebrity",
      email: "sarahcelebrity@example.com",
      password: "CelebrityPass123!",
      role: "CELEBRITY",
      isVerified: true
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: celebrityData.email
      }
    })

    if (existingUser) {
      console.log(`❌ User with email ${celebrityData.email} already exists`)
      return
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(celebrityData.password, 12)

    // Create the celebrity account
    const newCelebrity = await prisma.user.create({
      data: {
        name: celebrityData.name,
        email: celebrityData.email,
        password: hashedPassword,
        role: celebrityData.role,
        isVerified: celebrityData.isVerified
      }
    })

    // Create celebrity profile
    const celebrityProfile = await prisma.celebrity.create({
      data: {
        userId: newCelebrity.id,
        bio: "Professional celebrity with years of experience in entertainment and content creation.",
        longBio: "Sarah is a well-known celebrity who has been in the entertainment industry for over 10 years. She specializes in creating engaging content and connecting with fans.",
        category: "Entertainment",
        price: 150.00,
        rating: 4.8,
        averageRating: 4.8,
        totalReviews: 0,
        completionRate: 98,
        responseTime: "2 hours",
        isActive: true,
        verified: true,
        featured: false,
        tags: ["Entertainment", "Content Creation", "Fan Engagement"],
        achievements: ["10+ Years Experience", "1000+ Happy Fans", "Award Winner"],
        nextAvailable: "2024-01-20"
      }
    })

    console.log('🎉 Celebrity account created successfully!')
    console.log(`Name: ${newCelebrity.name}`)
    console.log(`Email: ${newCelebrity.email}`)
    console.log(`Role: ${newCelebrity.role}`)
    console.log(`Status: ${newCelebrity.isVerified ? '✅ Verified' : '❌ Not Verified'}`)
    console.log(`Category: ${celebrityProfile.category}`)
    console.log(`Price: $${celebrityProfile.price}`)
    console.log(`Rating: ⭐ ${celebrityProfile.rating}`)

    console.log('\n📋 Login Credentials:')
    console.log(`Email: ${celebrityData.email}`)
    console.log(`Password: ${celebrityData.password}`)

    console.log('\n🔗 Test your app:')
    console.log('https://kirawebfivr-obgsksxrv-harshan-ss-projects-0672cfbd.vercel.app')

  } catch (error) {
    console.error('❌ Error creating celebrity account:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createCelebrityAccount()
