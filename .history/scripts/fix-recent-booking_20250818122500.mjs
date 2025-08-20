import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()

async function fixRecentBooking() {
  try {
    console.log('🔧 Fixing recent booking status...')
    
    // Find the recent booking that should be pending
    const recentBooking = await prisma.booking.findFirst({
      where: {
        orderNumber: 'REQ-1755435882494'
      },
      include: {
        order: true,
        user: true,
        celebrity: { include: { user: true } }
      }
    })
    
    if (recentBooking) {
      console.log(`📋 Found recent booking: ${recentBooking.orderNumber}`)
      console.log(`   - Current Status: ${recentBooking.status}`)
      console.log(`   - Order Status: ${recentBooking.order.status}`)
      console.log(`   - Customer: ${recentBooking.user.name}`)
      console.log(`   - Celebrity: ${recentBooking.celebrity.user.name}`)
      
      // Update booking status to PENDING
      const updatedBooking = await prisma.booking.update({
        where: { id: recentBooking.id },
        data: { status: 'PENDING' }
      })
      
      console.log(`✅ Updated booking status to: ${updatedBooking.status}`)
      
      // Also update order status to PENDING
      const updatedOrder = await prisma.order.update({
        where: { id: recentBooking.orderId },
        data: { status: 'PENDING' }
      })
      
      console.log(`✅ Updated order status to: ${updatedOrder.status}`)
      
    } else {
      console.log('❌ Recent booking not found')
    }
    
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
        console.log(`   - ${booking.orderNumber} (Status: ${booking.status}, Order: ${booking.order.status})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error fixing recent booking:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixRecentBooking()
