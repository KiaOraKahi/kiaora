import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkOrderStatus() {
  try {
    console.log('🔍 Checking order status...')
    
    // Find the latest order
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: 'KO-1755510305390-0N4DRW'
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
    console.log('   Status:', order.status)
    console.log('   Payment Status:', order.paymentStatus)
    console.log('   Amount:', order.amount)
    console.log('   Created At:', order.createdAt)
    console.log('   Updated At:', order.updatedAt)
    
    if (order.booking) {
      console.log('📦 Booking Details:')
      console.log('   Booking ID:', order.booking.id)
      console.log('   Status:', order.booking.status)
      console.log('   Approval Status:', order.booking.approvalStatus)
      console.log('   Created At:', order.booking.createdAt)
    } else {
      console.log('⚠️  No booking found - webhook may not have triggered')
    }
    
    // Check if we need to manually create the booking
    if (!order.booking && order.paymentStatus === 'SUCCEEDED') {
      console.log('🔄 Creating booking manually...')
      
      const booking = await prisma.booking.create({
        data: {
          orderId: order.id,
          celebrityId: order.celebrityId,
          customerId: order.customerId,
          status: 'completed',
          approvalStatus: 'pending_approval',
          amount: order.amount,
          celebrityAmount: Math.floor(order.amount * 0.8), // 80% to celebrity
          tipAmount: 0,
          totalEarnings: Math.floor(order.amount * 0.8),
          requestedDate: order.requestedDate,
          deadline: order.deadline,
          instructions: order.instructions || '',
          recipientName: order.recipientName,
          occasion: order.occasion,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      console.log('✅ Booking created manually:', booking.id)
      console.log('   Status:', booking.status)
      console.log('   Approval Status:', booking.approvalStatus)
    }
    
    return order
    
  } catch (error) {
    console.error('❌ Error checking order status:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
checkOrderStatus()
  .then(() => {
    console.log('🎉 Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
