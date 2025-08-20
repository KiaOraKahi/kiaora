import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixOrderStatus() {
  try {
    console.log('🔧 Fixing order status...')
    
    // Find the order
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: 'KO-1755510305390-0N4DRW'
      }
    })
    
    if (!order) {
      console.log('❌ Order not found')
      return
    }
    
    console.log('📋 Current Order Status:')
    console.log('   Status:', order.status)
    console.log('   Payment Status:', order.paymentStatus)
    console.log('   Total Amount:', order.totalAmount)
    
    // Update order status
    const updatedOrder = await prisma.order.update({
      where: {
        id: order.id
      },
      data: {
        status: 'COMPLETED',
        paymentStatus: 'SUCCEEDED',
        totalAmount: 119.00, // $119 as float
        paidAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    console.log('✅ Order updated successfully!')
    console.log('   New Status:', updatedOrder.status)
    console.log('   New Payment Status:', updatedOrder.paymentStatus)
    console.log('   New Total Amount:', updatedOrder.totalAmount)
    
    // Create the booking
    console.log('🔄 Creating booking...')
    
    const booking = await prisma.booking.create({
      data: {
        orderId: order.id,
        celebrityId: order.celebrityId,
        customerId: order.customerId,
        status: 'completed',
        approvalStatus: 'pending_approval',
        amount: 11900, // $119 in cents
        celebrityAmount: 9520, // 80% of $119
        tipAmount: 0,
        totalEarnings: 9520,
        requestedDate: order.requestedDate,
        deadline: order.deadline,
        instructions: order.specialInstructions || '',
        recipientName: order.recipientName,
        occasion: order.occasion,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    console.log('✅ Booking created successfully!')
    console.log('   Booking ID:', booking.id)
    console.log('   Status:', booking.status)
    console.log('   Approval Status:', booking.approvalStatus)
    console.log('   Amount:', booking.amount)
    console.log('   Celebrity Amount:', booking.celebrityAmount)
    
    return { order: updatedOrder, booking }
    
  } catch (error) {
    console.error('❌ Error fixing order status:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
fixOrderStatus()
  .then(() => {
    console.log('🎉 Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
