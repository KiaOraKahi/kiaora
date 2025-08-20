import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAddUser() {
  try {
    console.log('🧪 Testing Add User Functionality...')
    
    // Count users before
    const beforeCount = await prisma.user.count()
    console.log(`👥 Users before: ${beforeCount}`)
    
    // Test adding a user
    console.log('\n➕ Testing user creation via API...')
    
    const testUser = {
      name: "Test User",
      email: "testuser@example.com",
      role: "FAN",
      password: "testpassword123"
    }
    
    console.log('Test user data:', testUser)
    
    // Simulate what the frontend does
    const response = await fetch('http://localhost:3000/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In real scenario, this would need authentication headers
      },
      body: JSON.stringify(testUser)
    })
    
    console.log('API Response Status:', response.status)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ API returned success:', result)
      
      // Count users after
      const afterCount = await prisma.user.count()
      console.log(`👥 Users after: ${afterCount}`)
      
      if (afterCount > beforeCount) {
        console.log(`✅ User successfully added! (+${afterCount - beforeCount})`)
        
        // Find the added user
        const addedUser = await prisma.user.findUnique({
          where: { email: testUser.email },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
          }
        })
        
        if (addedUser) {
          console.log('📋 Added user details:', addedUser)
          
          // Clean up - delete the test user
          await prisma.user.delete({
            where: { id: addedUser.id }
          })
          console.log('🧹 Test user cleaned up')
        }
      } else {
        console.log('❌ User count did not increase - user was not added')
      }
    } else {
      const error = await response.text()
      console.log('❌ API returned error:', error)
      
      if (response.status === 401) {
        console.log('🔒 This is expected - API requires admin authentication')
        console.log('✅ Add user API endpoint exists and is protected')
      }
    }
    
    // Also test direct database creation (simulating what API does)
    console.log('\n🔧 Testing direct database user creation...')
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash('testpassword123', 12)
    
    const directUser = await prisma.user.create({
      data: {
        name: 'Direct Test User',
        email: 'direct-test@example.com',
        role: 'FAN',
        password: hashedPassword,
        emailVerified: new Date()
      }
    })
    
    console.log('✅ Direct user creation successful:', {
      id: directUser.id,
      name: directUser.name,
      email: directUser.email,
      role: directUser.role
    })
    
    // Clean up direct user
    await prisma.user.delete({
      where: { id: directUser.id }
    })
    console.log('🧹 Direct test user cleaned up')
    
  } catch (error) {
    console.error('❌ Error testing add user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAddUser()
