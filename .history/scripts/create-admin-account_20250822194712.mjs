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

async function createAdminAccount() {
  console.log('👑 Creating Admin Account...\n')

  try {
    // Admin account details
    const adminData = {
      name: "Admin User",
      email: "admin@kiaora.com",
      password: "AdminPass123!",
      role: "ADMIN",
      isVerified: true
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: adminData.email
      }
    })

    if (existingUser) {
      console.log(`❌ User with email ${adminData.email} already exists`)
      return
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 12)

    // Create the admin account
    const newAdmin = await prisma.user.create({
      data: {
        name: adminData.name,
        email: adminData.email,
        password: hashedPassword,
        role: adminData.role,
        isVerified: adminData.isVerified
      }
    })

    console.log('🎉 Admin account created successfully!')
    console.log(`Name: ${newAdmin.name}`)
    console.log(`Email: ${newAdmin.email}`)
    console.log(`Role: ${newAdmin.role}`)
    console.log(`Status: ${newAdmin.isVerified ? '✅ Verified' : '❌ Not Verified'}`)

    console.log('\n📋 Login Credentials:')
    console.log(`Email: ${adminData.email}`)
    console.log(`Password: ${adminData.password}`)

    console.log('\n🔗 Admin Dashboard:')
    console.log('https://kirawebfivr-obgsksxrv-harshan-ss-projects-0672cfbd.vercel.app/admin')

    console.log('\n🔗 Test your app:')
    console.log('https://kirawebfivr-obgsksxrv-harshan-ss-projects-0672cfbd.vercel.app')

  } catch (error) {
    console.error('❌ Error creating admin account:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createAdminAccount()
