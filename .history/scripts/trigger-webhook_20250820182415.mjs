import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function triggerWebhook() {
  try {
    console.log('🔧 Manually triggering webhook for latest payment...')
    
    // Find the latest order
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: 'KO-1755511492776-3T0ZT4'
      },
      include: {
        celebrity: {
          include: {
            user: true
          }
        },
        user: true
      }
    })
    
    if (!order) {
      console.log('❌ Order not found')
      return
    }
    
    console.log('📋 Order found:', order.orderNumber)
    console.log('   Payment Intent ID:', order.paymentIntentId)
    console.log('   Current Status:', order.status)
    console.log('   Payment Status:', order.paymentStatus)
    
    // Simulate webhook processing
    console.log('🔄 Processing payment success...')
    
    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'SUCCEEDED',
        paidAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    console.log('✅ Order updated successfully!')
    console.log('   New Status:', updatedOrder.status)
    console.log('   New Payment Status:', updatedOrder.paymentStatus)
    
    // Create booking
    console.log('🎬 Creating booking...')
    
    const booking = await prisma.booking.create({
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        celebrityId: order.celebrityId,
        message: order.personalMessage,
        recipientName: order.recipientName,
        occasion: order.occasion,
        instructions: order.specialInstructions || null,
        specialInstructions: order.specialInstructions || null,
        status: 'PENDING',
        price: order.totalAmount,
        totalAmount: order.totalAmount,
        scheduledDate: order.scheduledDate,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      }
    })
    
    console.log('✅ Booking created successfully!')
    console.log('   Booking ID:', booking.id)
    console.log('   Status:', booking.status)
    console.log('   Order Number:', booking.orderNumber)
    
    console.log('🎉 Webhook processing completed!')
    console.log('📋 Summary:')
    console.log('   - Order status: CONFIRMED')
    console.log('   - Payment status: SUCCEEDED')
    console.log('   - Booking created: PENDING (waiting for celebrity acceptance)')
    
  } catch (error) {
    console.error('❌ Error triggering webhook:', error)
  } finally {
    await prisma.$disconnect()
  }
}

triggerWebhook()
  .then(() => {
    console.log('🎉 Script completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })



