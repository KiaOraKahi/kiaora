import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkLatestOrder() {
  try {
    console.log('🔍 Checking latest order status...')
    
    // Find the most recent order
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: 'KO-1755511492776-3T0ZT4'
      },
      include: {
        booking: true,
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    if (!order) {
      console.log('❌ Order not found')
      return
    }
    
    console.log('📋 Order Details:')
    console.log('   Order Number:', order.orderNumber)
    console.log('   Status:', order.status)
    console.log('   Payment Status:', order.paymentStatus)
    console.log('   Payment Intent ID:', order.paymentIntentId)
    console.log('   Total Amount:', order.totalAmount)
    console.log('   Created At:', order.createdAt)
    console.log('   Updated At:', order.updatedAt)
    
    if (order.booking) {
      console.log('✅ Booking Details:')
      console.log('   Booking ID:', order.booking.id)
      console.log('   Status:', order.booking.status)
      console.log('   Created At:', order.booking.createdAt)
    } else {
      console.log('⚠️  No booking found - webhook may not have triggered')
      console.log('🔧 This means the payment succeeded but the webhook didn\'t create the booking')
    }
    
    // Check if there are any recent webhook logs
    console.log('\n🔍 Checking for webhook activity...')
    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000) // Last 10 minutes
        }
      },
      select: {
        orderNumber: true,
        status: true,
        paymentStatus: true,
        paymentIntentId: true,
        createdAt: true,
        booking: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })
    
    console.log('📋 Recent orders:')
    recentOrders.forEach((o, i) => {
      console.log(`   ${i + 1}. ${o.orderNumber}`)
      console.log(`      - Status: ${o.status}`)
      console.log(`      - Payment: ${o.paymentStatus}`)
      console.log(`      - Payment Intent: ${o.paymentIntentId || 'NULL'}`)
      console.log(`      - Booking: ${o.booking ? o.booking.status : 'NOT CREATED'}`)
      console.log(`      - Created: ${o.createdAt}`)
    })
    
  } catch (error) {
    console.error('❌ Error checking order status:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkLatestOrder()
  .then(() => {
    console.log('🎉 Script completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
