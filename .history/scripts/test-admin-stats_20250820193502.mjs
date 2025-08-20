import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAdminStats() {
  try {
    console.log('🔍 Testing Admin Stats API...')
    
    // Get current date and last month date
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    
    console.log('📅 Date range:', { now: now.toISOString(), lastMonth: lastMonth.toISOString() })
    
    // Test the same queries as the API
    const [
      totalUsers,
      totalCelebrities,
      totalOrders,
      totalRevenue,
      lastMonthUsers,
      lastMonthCelebrities,
      lastMonthOrders,
      lastMonthRevenue
    ] = await Promise.all([
      prisma.user.count({ where: { role: "FAN" } }),
      prisma.celebrity.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { paymentStatus: "SUCCEEDED" },
        _sum: { totalAmount: true }
      }),
      prisma.user.count({ 
        where: { 
          role: "FAN",
          createdAt: { gte: lastMonth }
        } 
      }),
      prisma.celebrity.count({ 
        where: { 
          isActive: true,
          createdAt: { gte: lastMonth }
        } 
      }),
      prisma.order.count({ 
        where: { 
          createdAt: { gte: lastMonth }
        } 
      }),
      prisma.order.aggregate({
        where: { 
          paymentStatus: "SUCCEEDED",
          createdAt: { gte: lastMonth }
        },
        _sum: { totalAmount: true }
      })
    ])
    
    const currentRevenue = totalRevenue._sum.totalAmount || 0
    const lastMonthRevenueSum = lastMonthRevenue._sum.totalAmount || 0
    
    console.log('\n📊 Admin Stats Results:')
    console.log('Total Users:', totalUsers)
    console.log('Total Celebrities:', totalCelebrities)
    console.log('Total Orders:', totalOrders)
    console.log('Total Revenue:', currentRevenue)
    console.log('Last Month Users:', lastMonthUsers)
    console.log('Last Month Celebrities:', lastMonthCelebrities)
    console.log('Last Month Orders:', lastMonthOrders)
    console.log('Last Month Revenue:', lastMonthRevenueSum)
    
    // Check some sample orders to see their amounts
    console.log('\n🔍 Sample Orders:')
    const sampleOrders = await prisma.order.findMany({
      take: 5,
      select: {
        id: true,
        totalAmount: true,
        paymentStatus: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    sampleOrders.forEach(order => {
      console.log(`Order ${order.id}: $${order.totalAmount} (${order.paymentStatus}) - ${order.createdAt}`)
    })
    
    // Check if there are any orders with SUCCEEDED payment status
    const succeededOrders = await prisma.order.count({
      where: { paymentStatus: "SUCCEEDED" }
    })
    
    console.log(`\n✅ Orders with SUCCEEDED payment status: ${succeededOrders}`)
    
    if (currentRevenue === 0) {
      console.log('\n⚠️  WARNING: Total revenue is 0!')
      console.log('This could be because:')
      console.log('1. No orders have SUCCEEDED payment status')
      console.log('2. Orders have null/zero totalAmount values')
      console.log('3. Payment status is not set correctly')
    } else {
      console.log('\n✅ Revenue calculation is working correctly!')
    }
    
  } catch (error) {
    console.error('❌ Error testing admin stats:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminStats()
