import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixOrderStatus() {
  try {
    console.log('🔧 Fixing order status...')

    // Find the order
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: 'KO-1755510305390-0N4DRW',
      },
      include: {
        booking: true,
      },
    })

    if (!order) {
      console.log('❌ Order not found')
      return
    }

    console.log('📋 Current Order Status:')
    console.log('   Status:', order.status)
    console.log('   Payment Status:', order.paymentStatus)
    console.log('   Total Amount:', order.totalAmount)

    // Ensure order is marked paid
    const updatedOrder = await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'SUCCEEDED',
        paidAt: order.paidAt ?? new Date(),
        updatedAt: new Date(),
      },
    })

    console.log('✅ Order updated successfully!')
    console.log('   New Status:', updatedOrder.status)
    console.log('   New Payment Status:', updatedOrder.paymentStatus)

    if (order.booking) {
      console.log('ℹ️ Booking already exists:', order.booking.id)
      return
    }

    // Create the booking per current schema
    console.log('🔄 Creating booking to surface in dashboard...')

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
        status: 'PENDING', // waiting for celebrity action
        price: order.totalAmount,
        totalAmount: order.totalAmount,
        scheduledDate: order.scheduledDate,
        deadline: order.scheduledDate
          ? new Date(new Date(order.scheduledDate).getTime() + 3 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    })

    console.log('✅ Booking created successfully!')
    console.log('   Booking ID:', booking.id)
    console.log('   Status:', booking.status)
    console.log('   Order Number:', booking.orderNumber)
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
