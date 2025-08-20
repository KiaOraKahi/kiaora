import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugAdminIssues() {
  try {
    console.log('🔍 Debugging Admin Panel Issues...')
    
    // Check if settings exist in database
    console.log('\n📋 Checking Settings in Database...')
    
    const siteSettings = await prisma.siteSettings.findFirst()
    console.log('Site Settings:', siteSettings)
    
    const financialSettings = await prisma.financialSettings.findFirst()
    console.log('Financial Settings:', financialSettings)
    
    // Check if we have any orders/bookings
    console.log('\n📋 Checking Orders/Bookings...')
    
    const orders = await prisma.order.findMany({
      take: 5,
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
    
    console.log(`Found ${orders.length} orders`)
    
    if (orders.length > 0) {
      const firstOrder = orders[0]
      console.log('First order details:', {
        id: firstOrder.id,
        orderNumber: firstOrder.orderNumber,
        status: firstOrder.status,
        paymentStatus: firstOrder.paymentStatus,
        bookingStatus: firstOrder.booking?.status,
        customer: firstOrder.user.name,
        celebrity: firstOrder.celebrity?.user.name
      })
    }
    
    // Test the booking status update logic
    console.log('\n🔧 Testing Booking Status Update Logic...')
    
    if (orders.length > 0) {
      const testOrder = orders[0]
      
      // Test updating booking status
      if (testOrder.booking) {
        console.log('Testing booking status update for order:', testOrder.id)
        
        try {
          const updatedBooking = await prisma.booking.update({
            where: { orderId: testOrder.id },
            data: { status: "CONFIRMED" }
          })
          console.log('✅ Booking status updated successfully:', updatedBooking.status)
          
          // Revert the change
          await prisma.booking.update({
            where: { orderId: testOrder.id },
            data: { status: testOrder.booking.status }
          })
          console.log('🔄 Reverted booking status')
        } catch (error) {
          console.log('❌ Error updating booking status:', error.message)
        }
      } else {
        console.log('❌ No booking record found for order:', testOrder.id)
      }
    }
    
    // Check if we have admin users
    console.log('\n👑 Checking Admin Users...')
    
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })
    
    console.log(`Found ${adminUsers.length} admin users:`, adminUsers)
    
    console.log('\n📋 Summary of Issues:')
    console.log('1. Settings fetch issue: Check if admin authentication is working')
    console.log('2. Booking status update: The API logic looks correct')
    console.log('3. Need to verify admin session is properly established')
    
  } catch (error) {
    console.error('❌ Error debugging admin issues:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugAdminIssues()
