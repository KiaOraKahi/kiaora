import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyTestUser() {
  try {
    console.log('🔧 Verifying test user email...')
    
    // Find the test user by email pattern
    const testUser = await prisma.user.findFirst({
      where: {
        email: {
          contains: 'testuser',
          endsWith: '@example.com'
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    if (!testUser) {
      console.log('❌ No test user found')
      return
    }
    
    console.log('📧 Found test user:', testUser.email)
    
    // Update the user to mark email as verified
    const updatedUser = await prisma.user.update({
      where: {
        id: testUser.id
      },
      data: {
        emailVerified: new Date(),
        updatedAt: new Date()
      }
    })
    
    console.log('✅ Test user email verified successfully!')
    console.log('📧 Email:', updatedUser.email)
    console.log('🔑 Password: password123')
    console.log('👤 Role:', updatedUser.role)
    console.log('🆔 User ID:', updatedUser.id)
    console.log('✅ Email Verified:', updatedUser.emailVerified)
    
    return updatedUser
    
  } catch (error) {
    console.error('❌ Error verifying test user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
verifyTestUser()
  .then(() => {
    console.log('🎉 Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
