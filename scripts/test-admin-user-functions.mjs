import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAdminUserFunctions() {
  try {
    console.log('🧪 Testing Admin User Management Functions...\n')

    // Test 1: Check if we have any users
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true
      }
    })

    console.log('📋 Current Users:')
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role}`)
    })

    // Test 2: Check if we have any admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, name: true, email: true }
    })

    console.log('\n👑 Admin Users:')
    if (adminUsers.length === 0) {
      console.log('  ❌ No admin users found!')
      console.log('  💡 You need to create an admin user first.')
    } else {
      adminUsers.forEach(admin => {
        console.log(`  ✅ ${admin.name} (${admin.email})`)
      })
    }

    // Test 3: Check user counts by role
    const userCounts = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    })

    console.log('\n📊 User Counts by Role:')
    userCounts.forEach(count => {
      console.log(`  - ${count.role}: ${count._count.role}`)
    })

    // Test 4: Check recent orders
    const recentOrders = await prisma.order.findMany({
      take: 3,
      include: {
        user: { select: { name: true } },
        celebrity: { 
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log('\n📦 Recent Orders:')
    if (recentOrders.length === 0) {
      console.log('  ❌ No orders found!')
    } else {
      recentOrders.forEach(order => {
        console.log(`  - ${order.user?.name || 'Unknown'} → ${order.celebrity?.user?.name || 'Unknown'} - $${order.totalAmount}`)
      })
    }

    console.log('\n✅ Admin User Management Test Complete!')
    console.log('\n💡 To test the admin panel:')
    console.log('  1. Make sure you have an admin user in the database')
    console.log('  2. Login to the admin panel at /admin/login')
    console.log('  3. Navigate to the Users tab to test the functionality')

  } catch (error) {
    console.error('❌ Error testing admin functions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminUserFunctions()
