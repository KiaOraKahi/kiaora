import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('🔍 Checking Database State...')
    
    const users = await prisma.user.count()
    const celebrities = await prisma.celebrity.count()
    const orders = await prisma.order.count()
    const totalRevenue = await prisma.order.aggregate({
      where: { paymentStatus: "SUCCEEDED" },
      _sum: { totalAmount: true }
    })
    
    console.log('\n📊 Database Counts:')
    console.log('Users:', users)
    console.log('Celebrities:', celebrities)
    console.log('Orders:', orders)
    console.log('Total Revenue:', totalRevenue._sum.totalAmount || 0)
    
    if (users === 0) {
      console.log('\n⚠️  WARNING: No users found! Database was reset.')
      console.log('You need to recreate the admin user and other data.')
    }
    
    // Check if admin user exists
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" }
    })
    
    if (!adminUser) {
      console.log('\n❌ No admin user found!')
      console.log('You need to create an admin user to access the admin panel.')
    } else {
      console.log('\n✅ Admin user found:', adminUser.email)
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
