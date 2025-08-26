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

async function verifyAccount() {
  console.log('✅ Verifying Test Account...\n')

  try {
    // Find the test account
    const user = await prisma.user.findFirst({
      where: {
        email: 'idkkwhoiam@gmail.com'
      }
    })

    if (!user) {
      console.log('❌ Test account not found')
      return
    }

    console.log(`Found user: ${user.name} (${user.email})`)
    console.log(`Current status: ${user.isVerified ? '✅ Verified' : '❌ Not Verified'}`)

    // Verify the account
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        isVerified: true
      }
    })

    console.log(`\n🎉 Account verified successfully!`)
    console.log(`User: ${updatedUser.name} (${updatedUser.email})`)
    console.log(`Status: ${updatedUser.isVerified ? '✅ Verified' : '❌ Not Verified'}`)
    console.log(`Role: ${updatedUser.role}`)

    console.log('\n📋 You can now:')
    console.log('1. Go to your Vercel app: https://kirawebfivr-obgsksxrv-harshan-ss-projects-0672cfbd.vercel.app')
    console.log('2. Click "Sign In"')
    console.log('3. Use these credentials:')
    console.log(`   Email: ${updatedUser.email}`)
    console.log('   Password: (the password you used during signup)')

  } catch (error) {
    console.error('❌ Error verifying account:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
verifyAccount()
