import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixOrderAmount() {
  try {
    console.log('🔧 Fixing order amount...')
    
    // Find the order
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: 'KO-1755511492776-3T0ZT4'
      }
    })
    
    if (!order) {
      console.log('❌ Order not found')
      return
    }
    
    console.log('📋 Current Order Details:')
    console.log('   Order Number:', order.orderNumber)
    console.log('   Total Amount:', order.totalAmount)
    console.log('   Celebrity Amount:', order.celebrityAmount)
    console.log('   Platform Fee:', order.platformFee)
    
    // Calculate celebrity amount (80% of total)
    const celebrityAmount = Math.floor(order.totalAmount * 0.8)
    const platformFee = order.totalAmount - celebrityAmount
    
    console.log('💰 Calculated amounts:')
    console.log('   Total Amount:', order.totalAmount)
    console.log('   Celebrity Amount (80%):', celebrityAmount)
    console.log('   Platform Fee (20%):', platformFee)
    
    // Update the order with correct amounts
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        celebrityAmount: celebrityAmount,
        platformFee: platformFee,
        updatedAt: new Date()
      }
    })
    
    console.log('✅ Order updated successfully!')
    console.log('   New Celebrity Amount:', updatedOrder.celebrityAmount)
    console.log('   New Platform Fee:', updatedOrder.platformFee)
    
    // Also update the booking amount
    const booking = await prisma.booking.findFirst({
      where: { orderId: order.id }
    })
    
    if (booking) {
      const updatedBooking = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          price: order.totalAmount,
          totalAmount: order.totalAmount,
          updatedAt: new Date()
        }
      })
      
      console.log('✅ Booking updated successfully!')
      console.log('   New Price:', updatedBooking.price)
      console.log('   New Total Amount:', updatedBooking.totalAmount)
    }
    
    console.log('🎉 Amount fix completed!')
    console.log('📋 Summary:')
    console.log('   - Order totalAmount: $' + order.totalAmount)
    console.log('   - Celebrity amount: $' + celebrityAmount)
    console.log('   - Platform fee: $' + platformFee)
    console.log('   - UI should now show: $' + celebrityAmount)
    
  } catch (error) {
    console.error('❌ Error fixing order amount:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixOrderAmount()
  .then(() => {
    console.log('🎉 Script completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })



