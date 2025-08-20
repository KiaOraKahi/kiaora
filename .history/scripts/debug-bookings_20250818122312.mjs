import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()

async function debugBookings() {
  try {
    console.log('🔍 Debugging booking requests...')
    
    // 1. Check all celebrities
    console.log('\n1. Checking all celebrities:')
    const celebrities = await prisma.celebrity.findMany({
      include: { user: true }
    })
    
    celebrities.forEach(celeb => {
      console.log(`   - ${celeb.user.name} (ID: ${celeb.id}, User ID: ${celeb.userId})`)
    })
    
    // 2. Check all orders
    console.log('\n2. Checking all orders:')
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        celebrity: { include: { user: true } },
        booking: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    orders.forEach(order => {
      console.log(`   - Order: ${order.orderNumber}`)
      console.log(`     - Customer: ${order.user.name}`)
      console.log(`     - Celebrity: ${order.celebrity.user.name}`)
      console.log(`     - Status: ${order.status}`)
      console.log(`     - Payment Status: ${order.paymentStatus}`)
      console.log(`     - Has Booking: ${!!order.booking}`)
      console.log(`     - Created: ${order.createdAt}`)
    })
    
    // 3. Check all bookings
    console.log('\n3. Checking all bookings:')
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        celebrity: { include: { user: true } },
        order: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    bookings.forEach(booking => {
      console.log(`   - Booking: ${booking.orderNumber}`)
      console.log(`     - Customer: ${booking.user.name}`)
      console.log(`     - Celebrity: ${booking.celebrity.user.name}`)
      console.log(`     - Status: ${booking.status}`)
      console.log(`     - Order Status: ${booking.order.status}`)
      console.log(`     - Payment Status: ${booking.order.paymentStatus}`)
      console.log(`     - Created: ${booking.createdAt}`)
    })
    
    // 4. Check Emma Stone specifically
    console.log('\n4. Checking Emma Stone specifically:')
    const emmaStone = await prisma.celebrity.findFirst({
      where: {
        user: { name: { contains: 'Emma' } }
      },
      include: {
        user: true,
        bookings: {
          include: {
            user: true,
            order: true
          }
        },
        orders: {
          include: {
            user: true,
            booking: true
          }
        }
      }
    })
    
    if (emmaStone) {
      console.log(`   - Emma Stone found: ${emmaStone.user.name}`)
      console.log(`   - Celebrity ID: ${emmaStone.id}`)
      console.log(`   - User ID: ${emmaStone.userId}`)
      console.log(`   - Orders count: ${emmaStone.orders.length}`)
      console.log(`   - Bookings count: ${emmaStone.bookings.length}`)
      
      emmaStone.orders.forEach(order => {
        console.log(`     - Order: ${order.orderNumber} (Status: ${order.status}, Payment: ${order.paymentStatus})`)
      })
      
      emmaStone.bookings.forEach(booking => {
        console.log(`     - Booking: ${booking.orderNumber} (Status: ${booking.status})`)
      })
    } else {
      console.log('   - Emma Stone not found')
    }
    
  } catch (error) {
    console.error('❌ Error debugging bookings:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugBookings()
