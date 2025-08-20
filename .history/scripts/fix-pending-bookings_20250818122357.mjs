import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()

async function fixPendingBookings() {
  try {
    console.log('🔧 Fixing pending bookings...')
    
    // Find orders that have succeeded payments but no booking records
    const pendingOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'SUCCEEDED',
        booking: null, // No booking record exists
        status: 'PENDING' // Order is still pending
      },
      include: {
        user: true,
        celebrity: { include: { user: true } }
      }
    })
    
    console.log(`📋 Found ${pendingOrders.length} orders with succeeded payments but no booking records:`)
    
    for (const order of pendingOrders) {
      console.log(`\n🔄 Processing order: ${order.orderNumber}`)
      console.log(`   - Customer: ${order.user.name}`)
      console.log(`   - Celebrity: ${order.celebrity.user.name}`)
      console.log(`   - Amount: $${order.totalAmount}`)
      console.log(`   - Payment Status: ${order.paymentStatus}`)
      
      // Create booking record
      const booking = await prisma.booking.create({
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          userId: order.userId,
          celebrityId: order.celebrityId,
          message: order.personalMessage,
          recipientName: order.recipientName,
          occasion: order.occasion,
          instructions: order.specialInstructions,
          price: order.celebrityAmount || order.totalAmount * 0.8, // 80% of total
          totalAmount: order.totalAmount,
          status: 'PENDING', // Booking starts as pending
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        }
      })
      
      console.log(`✅ Created booking: ${booking.orderNumber}`)
      console.log(`   - Booking ID: ${booking.id}`)
      console.log(`   - Status: ${booking.status}`)
    }
    
    console.log('\n🎉 Fixed pending bookings!')
    
    // Verify the fix
    const emmaStone = await prisma.celebrity.findFirst({
      where: {
        user: { name: { contains: 'Emma' } }
      },
      include: {
        bookings: {
          where: { status: 'PENDING' },
          include: { order: true }
        }
      }
    })
    
    if (emmaStone) {
      console.log(`\n📊 Emma Stone now has ${emmaStone.bookings.length} pending bookings:`)
      emmaStone.bookings.forEach(booking => {
        console.log(`   - ${booking.orderNumber} (Status: ${booking.status})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error fixing pending bookings:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixPendingBookings()
