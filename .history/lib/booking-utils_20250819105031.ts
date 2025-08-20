import { prisma } from './prisma'

/**
 * Ensures a booking record exists for an order
 * This is a safety mechanism to prevent missing booking records
 */
export async function ensureBookingRecord(orderId: string) {
  try {
    // Check if booking already exists
    const existingBooking = await prisma.booking.findUnique({
      where: { orderId }
    })

    if (existingBooking) {
      console.log(`✅ Booking record already exists for order ${orderId}`)
      return existingBooking
    }

    // Get the order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        celebrity: true
      }
    })

    if (!order) {
      throw new Error(`Order not found: ${orderId}`)
    }

    console.log(`🔧 Creating missing booking record for order ${orderId}`)

    // Create the booking record
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
        status: "PENDING", // Default status for new bookings
        price: order.totalAmount,
        totalAmount: order.totalAmount,
        scheduledDate: order.scheduledDate,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      }
    })

    console.log(`✅ Created booking record: ${booking.id}`)
    return booking
  } catch (error) {
    console.error(`❌ Error ensuring booking record for order ${orderId}:`, error)
    throw error
  }
}

/**
 * Creates a booking record for an order (used during order creation)
 */
export async function createBookingRecord(order: any) {
  try {
    console.log(`🎬 Creating booking record for order ${order.orderNumber}`)

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
        status: "PENDING",
        price: order.totalAmount,
        totalAmount: order.totalAmount,
        scheduledDate: order.scheduledDate,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    })

    console.log(`✅ Booking record created: ${booking.id}`)
    return booking
  } catch (error) {
    console.error(`❌ Error creating booking record:`, error)
    throw error
  }
}

/**
 * Finds and fixes all orders without booking records
 */
export async function fixMissingBookingRecords() {
  try {
    console.log('🔍 Finding orders without booking records...')

    const ordersWithoutBookings = await prisma.order.findMany({
      where: {
        booking: null,
        // Only include orders that should have bookings (not tips, etc.)
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED']
        }
      },
      include: {
        user: true,
        celebrity: true
      }
    })

    console.log(`📋 Found ${ordersWithoutBookings.length} orders without booking records`)

    const results = []
    for (const order of ordersWithoutBookings) {
      try {
        const booking = await createBookingRecord(order)
        results.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          bookingId: booking.id,
          status: 'created'
        })
      } catch (error) {
        results.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          error: error.message,
          status: 'failed'
        })
      }
    }

    console.log('📊 Fix results:', results)
    return results
  } catch (error) {
    console.error('❌ Error fixing missing booking records:', error)
    throw error
  }
}

/**
 * Validates that an order has a booking record
 */
export async function validateOrderBooking(orderId: string) {
  const booking = await prisma.booking.findUnique({
    where: { orderId }
  })

  if (!booking) {
    console.warn(`⚠️ Order ${orderId} missing booking record`)
    return false
  }

  return true
}
