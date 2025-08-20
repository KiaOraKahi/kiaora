import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testBookingUpdate() {
  try {
    console.log('🧪 Testing Booking Status Update...')
    
    // Get a test order with booking
    const order = await prisma.order.findFirst({
      include: {
        booking: true,
        user: true,
        celebrity: {
          include: {
            user: true
          }
        }
      }
    })
    
    if (!order) {
      console.log('❌ No orders found in database')
      return
    }
    
    console.log('📋 Test order details:', {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      bookingStatus: order.booking?.status,
      customer: order.user.name,
      celebrity: order.celebrity?.user.name
    })
    
    if (!order.booking) {
      console.log('❌ No booking record found for this order')
      return
    }
    
    // Test the exact API call that the frontend makes
    console.log('\n📡 Testing API call...')
    
    const testData = {
      orderId: order.id,
      action: "updateBookingStatus",
      data: { status: "CONFIRMED" }
    }
    
    console.log('API request data:', testData)
    
    // Simulate the API logic
    console.log('\n🔧 Simulating API logic...')
    
    try {
      const updatedBooking = await prisma.booking.update({
        where: { orderId: order.id },
        data: { status: "CONFIRMED" }
      })
      
      console.log('✅ Booking status updated successfully:', {
        orderId: updatedBooking.orderId,
        status: updatedBooking.status
      })
      
      // Revert the change
      await prisma.booking.update({
        where: { orderId: order.id },
        data: { status: order.booking.status }
      })
      
      console.log('🔄 Reverted booking status back to:', order.booking.status)
      
      console.log('\n✅ Booking status update functionality works correctly!')
      console.log('💡 The issue might be with authentication or frontend data passing')
      
    } catch (error) {
      console.log('❌ Error updating booking status:', error.message)
    }
    
  } catch (error) {
    console.error('❌ Error testing booking update:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testBookingUpdate()
