import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkOrderAmount() {
  try {
    console.log('🔍 Checking order amount issue...')
    
    // Find the order
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: 'KO-1755511492776-3T0ZT4'
      },
      include: {
        booking: true,
        items: true
      }
    })
    
    if (!order) {
      console.log('❌ Order not found')
      return
    }
    
    console.log('📋 Order Details:')
    console.log('   Order Number:', order.orderNumber)
    console.log('   Total Amount:', order.totalAmount)
    console.log('   Status:', order.status)
    console.log('   Payment Status:', order.paymentStatus)
    
    if (order.booking) {
      console.log('📋 Booking Details:')
      console.log('   Booking ID:', order.booking.id)
      console.log('   Price:', order.booking.price)
      console.log('   Total Amount:', order.booking.totalAmount)
      console.log('   Status:', order.booking.status)
    }
    
    // Check the API response format
    console.log('\n🔍 Simulating API response...')
    
    const booking = await prisma.booking.findFirst({
      where: {
        orderId: order.id
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true
          }
        },
        order: {
          select: {
            orderNumber: true,
            totalAmount: true,
            celebrityAmount: true,
            paymentStatus: true,
            approvalStatus: true,
            approvedAt: true,
            videoUrl: true,
            declineReason: true,
            declinedAt: true,
            revisionCount: true,
            tips: {
              where: {
                paymentStatus: "SUCCEEDED"
              },
              select: {
                id: true,
                amount: true,
                message: true,
                createdAt: true
              }
            }
          }
        }
      }
    })
    
    if (booking) {
      console.log('📋 API Response Simulation:')
      console.log('   Order Total Amount:', booking.order?.totalAmount)
      console.log('   Celebrity Amount:', booking.order?.celebrityAmount)
      console.log('   Payment Status:', booking.order?.paymentStatus)
      console.log('   Tips Count:', booking.order?.tips?.length || 0)
      
      // Calculate what the API would return
      const totalTips = booking.order?.tips?.reduce((sum, tip) => sum + tip.amount, 0) || 0
      const amount = booking.order?.totalAmount || 0
      const celebrityAmount = booking.order?.celebrityAmount || 0
      const totalEarnings = celebrityAmount + totalTips
      
      console.log('\n💰 Calculated Values:')
      console.log('   Amount (should show in UI):', amount)
      console.log('   Celebrity Amount:', celebrityAmount)
      console.log('   Tip Amount:', totalTips)
      console.log('   Total Earnings:', totalEarnings)
      
      if (amount === 0) {
        console.log('\n❌ ISSUE FOUND: Order totalAmount is 0!')
        console.log('🔧 This means the order was created with 0 amount')
      } else {
        console.log('\n✅ Order amount is correct:', amount)
        console.log('🔍 The issue might be in the frontend display')
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking order amount:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkOrderAmount()
  .then(() => {
    console.log('🎉 Script completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })



