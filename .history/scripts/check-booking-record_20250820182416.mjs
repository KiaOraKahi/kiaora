import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkBookingRecord() {
  try {
    console.log('🔍 Checking if booking record exists for recent order...\n');

    // Find the most recent order for Emma Stone
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

    // Get the most recent order
    const recentOrder = await prisma.order.findFirst({
      where: {
        celebrityId: celebrity.id
      },
      include: {
        user: true,
        booking: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!recentOrder) {
      console.log('❌ No recent orders found');
      return;
    }

    console.log('📋 Most Recent Order Details:');
    console.log(`  - Order ID: ${recentOrder.id}`);
    console.log(`  - Order Number: ${recentOrder.orderNumber}`);
    console.log(`  - Customer Name: ${recentOrder.user?.name || 'N/A'}`);
    console.log(`  - Status: ${recentOrder.status}`);
    console.log(`  - Approval Status: ${recentOrder.approvalStatus || 'NULL'}`);
    console.log(`  - Payment Status: ${recentOrder.paymentStatus}`);
    console.log(`  - Created: ${recentOrder.createdAt}`);

    // Check if booking record exists
    if (recentOrder.booking) {
      console.log('\n✅ Booking record EXISTS:');
      console.log(`  - Booking ID: ${recentOrder.booking.id}`);
      console.log(`  - Booking Status: ${recentOrder.booking.status}`);
      console.log(`  - Recipient Name: ${recentOrder.booking.recipientName}`);
      console.log(`  - Occasion: ${recentOrder.booking.occasion || 'N/A'}`);
      console.log(`  - Created: ${recentOrder.booking.createdAt}`);
    } else {
      console.log('\n❌ NO Booking record found for this order!');
      console.log('   This is why the booking is not showing up in Emma Stone\'s requests.');
    }

    // Check all bookings for this celebrity
    const allBookings = await prisma.booking.findMany({
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
      },
      take: 5
    });

    console.log('\n📊 Recent Bookings for Emma Stone:');
    allBookings.forEach((booking, index) => {
      console.log(`  ${index + 1}. ${booking.order?.user?.name || 'Unknown'} - ${booking.status} (${booking.createdAt})`);
    });

    // Check if there are any orders without bookings
    const ordersWithoutBookings = await prisma.order.findMany({
      where: {
        celebrityId: celebrity.id,
        booking: null
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    console.log('\n📋 Orders WITHOUT Booking Records:');
    ordersWithoutBookings.forEach((order, index) => {
      console.log(`  ${index + 1}. ${order.user?.name || 'Unknown'} - ${order.status} (${order.createdAt})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBookingRecord();

