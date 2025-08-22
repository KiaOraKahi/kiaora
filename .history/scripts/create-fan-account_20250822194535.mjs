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

async function createFanAccount() {
  console.log('👥 Creating Fan Account...\n')

  try {
    // Fan account details
    const fanData = {
      name: "John Fan",
      email: "johnfan@example.com",
      password: "FanPassword123!",
      role: "FAN",
      isVerified: true
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: fanData.email
      }
    })

    if (existingUser) {
      console.log(`❌ User with email ${fanData.email} already exists`)
      return
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(fanData.password, 12)

    // Create the fan account
    const newFan = await prisma.user.create({
      data: {
        name: fanData.name,
        email: fanData.email,
        password: hashedPassword,
        role: fanData.role,
        isVerified: fanData.isVerified
      }
    })

    console.log('🎉 Fan account created successfully!')
    console.log(`Name: ${newFan.name}`)
    console.log(`Email: ${newFan.email}`)
    console.log(`Role: ${newFan.role}`)
    console.log(`Status: ${newFan.isVerified ? '✅ Verified' : '❌ Not Verified'}`)

    console.log('\n📋 Login Credentials:')
    console.log(`Email: ${fanData.email}`)
    console.log(`Password: ${fanData.password}`)

    console.log('\n🔗 Test your app:')
    console.log('https://kirawebfivr-obgsksxrv-harshan-ss-projects-0672cfbd.vercel.app')

  } catch (error) {
    console.error('❌ Error creating fan account:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createFanAccount()
