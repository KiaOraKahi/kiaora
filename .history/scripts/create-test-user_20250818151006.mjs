import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    console.log('🔧 Creating test user...')
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: 'testuser@example.com'
      }
    })
    
    if (existingUser) {
      console.log('⚠️  User already exists:', existingUser.email)
      return existingUser
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'testuser@example.com',
        password: hashedPassword,
        role: 'FAN',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    console.log('✅ Test user created successfully!')
    console.log('📧 Email:', newUser.email)
    console.log('🔑 Password: password123')
    console.log('👤 Role:', newUser.role)
    console.log('🆔 User ID:', newUser.id)
    
    return newUser
    
  } catch (error) {
    console.error('❌ Error creating test user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createTestUser()
  .then(() => {
    console.log('🎉 Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
