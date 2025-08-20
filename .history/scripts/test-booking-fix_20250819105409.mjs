import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testBookingFix() {
  try {
    console.log('🧪 Testing booking record fix...\n');

    // Test 1: Check if Sarah Johnson Meade's booking is now visible
    console.log('📋 Test 1: Checking Sarah Johnson Meade\'s booking...');
    
    const celebrity = await prisma.celebrity.findFirst({
      where: {
        user: {
          name: {
            contains: 'Emma',
            mode: 'insensitive'
          }
        }
      },
      include: {
        user: true
      }
    });

    if (!celebrity) {
      console.log('❌ Emma Stone not found');
      return;
    }

    console.log(`👤 Found celebrity: ${celebrity.user.name} (ID: ${celebrity.id})\n`);

    // Get all bookings for Emma Stone
    const bookings = await prisma.booking.findMany({
      where: {
        celebrityId: celebrity.id
      },
      include: {
        order: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Found ${bookings.length} total bookings for Emma Stone\n`);

    // Find Sarah Johnson's booking
    const sarahBooking = bookings.find(booking => 
      booking.order?.user?.name?.toLowerCase().includes('sarah') ||
      booking.order?.user?.name?.toLowerCase().includes('johnson')
    );

    if (sarahBooking) {
      console.log('✅ Sarah Johnson\'s booking found!');
      console.log(`   - Booking ID: ${sarahBooking.id}`);
      console.log(`   - Order Number: ${sarahBooking.orderNumber}`);
      console.log(`   - Status: ${sarahBooking.status}`);
      console.log(`   - Recipient: ${sarahBooking.recipientName}`);
      console.log(`   - Occasion: ${sarahBooking.occasion}`);
      console.log(`   - Amount: $${sarahBooking.totalAmount}`);
      console.log(`   - Created: ${sarahBooking.createdAt}`);
    } else {
      console.log('❌ Sarah Johnson\'s booking not found');
    }

    // Test 2: Check if there are any orders without bookings
    console.log('\n📋 Test 2: Checking for orders without bookings...');
    
    const ordersWithoutBookings = await prisma.order.findMany({
      where: {
        celebrityId: celebrity.id,
        booking: null,
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED']
        }
      },
      include: {
        user: true
      }
    });

    if (ordersWithoutBookings.length === 0) {
      console.log('✅ No orders without booking records found!');
    } else {
      console.log(`❌ Found ${ordersWithoutBookings.length} orders without booking records:`);
      ordersWithoutBookings.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.orderNumber} - ${order.user?.name || 'Unknown'}`);
      });
    }

    // Test 3: Simulate the booking requests API call
    console.log('\n📋 Test 3: Simulating booking requests API...');
    
    const ordersForCelebrity = await prisma.order.findMany({
      where: {
        celebrityId: celebrity.id,
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED']
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        booking: true,
        tips: {
          where: {
            paymentStatus: "SUCCEEDED", 
          },
          select: {
            id: true,
            amount: true,
            message: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`📊 Found ${ordersForCelebrity.length} orders for Emma Stone`);

    const ordersWithBookings = ordersForCelebrity.filter(order => order.booking);
    const ordersMissingBookings = ordersForCelebrity.filter(order => !order.booking);

    console.log(`   ✅ Orders with bookings: ${ordersWithBookings.length}`);
    console.log(`   ❌ Orders missing bookings: ${ordersMissingBookings.length}`);

    if (ordersMissingBookings.length > 0) {
      console.log('\n❌ Orders missing bookings:');
      ordersMissingBookings.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.orderNumber} - ${order.user?.name || 'Unknown'}`);
      });
    }

    // Test 4: Check if the booking requests would be visible
    console.log('\n📋 Test 4: Checking visible booking requests...');
    
    const visibleBookings = ordersWithBookings
      .filter(order => order.booking.status === 'PENDING')
      .slice(0, 10); // Limit to 10 for display

    console.log(`📋 Found ${visibleBookings.length} PENDING booking requests that would be visible:`);
    
    visibleBookings.forEach((order, index) => {
      console.log(`   ${index + 1}. ${order.user?.name || 'Unknown'} - ${order.booking.status} (${order.orderNumber})`);
    });

    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`   ✅ Total bookings: ${bookings.length}`);
    console.log(`   ✅ Orders with bookings: ${ordersWithBookings.length}`);
    console.log(`   ❌ Orders missing bookings: ${ordersMissingBookings.length}`);
    console.log(`   📋 Visible PENDING requests: ${visibleBookings.length}`);
    
    if (ordersMissingBookings.length === 0) {
      console.log('\n🎉 All tests passed! The booking record fix is working correctly.');
    } else {
      console.log('\n⚠️ Some orders are still missing booking records. Manual intervention may be needed.');
    }

  } catch (error) {
    console.error('❌ Error testing booking fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBookingFix();
