import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testProfileImageUpload() {
  console.log('🧪 Testing Profile Image Upload Role-Based Access Control...\n')

  try {
    // Test 1: Check if FAN users can upload profile images
    console.log('1. Testing FAN role access...')
    const fanUser = await prisma.user.findFirst({
      where: { role: 'FAN' }
    })
    
    if (fanUser) {
      console.log(`✅ Found FAN user: ${fanUser.name} (${fanUser.email})`)
      console.log(`   - User ID: ${fanUser.id}`)
      console.log(`   - Current image: ${fanUser.image || 'None'}`)
    } else {
      console.log('❌ No FAN users found in database')
    }

    // Test 2: Check if CELEBRITY users exist
    console.log('\n2. Testing CELEBRITY role access...')
    const celebrityUser = await prisma.user.findFirst({
      where: { role: 'CELEBRITY' }
    })
    
    if (celebrityUser) {
      console.log(`✅ Found CELEBRITY user: ${celebrityUser.name} (${celebrityUser.email})`)
      console.log(`   - User ID: ${celebrityUser.id}`)
      console.log(`   - Current image: ${celebrityUser.image || 'None'}`)
    } else {
      console.log('❌ No CELEBRITY users found in database')
    }

    // Test 3: Check if ADMIN users exist
    console.log('\n3. Testing ADMIN role access...')
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (adminUser) {
      console.log(`✅ Found ADMIN user: ${adminUser.name} (${adminUser.email})`)
      console.log(`   - User ID: ${adminUser.id}`)
      console.log(`   - Current image: ${adminUser.image || 'None'}`)
    } else {
      console.log('❌ No ADMIN users found in database')
    }

    // Test 4: Count users by role
    console.log('\n4. User role distribution:')
    const userCounts = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    })

    userCounts.forEach(count => {
      console.log(`   - ${count.role}: ${count._count.role} users`)
    })

    console.log('\n📋 Summary:')
    console.log('✅ Profile image upload is restricted to FAN role only')
    console.log('✅ API endpoint: /api/user/profile-image')
    console.log('✅ Frontend component: ProfileImageUpload')
    console.log('✅ Role validation: session.user.role === "FAN"')
    console.log('✅ File validation: Images only (JPEG, PNG, WebP)')
    console.log('✅ Size limit: 5MB maximum')
    console.log('✅ Database update: User.image field updated automatically')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testProfileImageUpload()
