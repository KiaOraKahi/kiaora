import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function fixMissingBooking() {
  try {
    console.log('🔧 Fixing missing booking record for Sarah Johnson Meade...\n');

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

    console.log('📋 Recent Order Details:');
    console.log(`  - Order ID: ${recentOrder.id}`);
    console.log(`  - Order Number: ${recentOrder.orderNumber}`);
    console.log(`  - Customer Name: ${recentOrder.user?.name || 'N/A'}`);
    console.log(`  - Status: ${recentOrder.status}`);
    console.log(`  - Payment Status: ${recentOrder.paymentStatus}`);
    console.log(`  - Created: ${recentOrder.createdAt}`);

    // Check if booking already exists
    if (recentOrder.booking) {
      console.log('\n✅ Booking record already exists!');
      console.log(`  - Booking ID: ${recentOrder.booking.id}`);
      console.log(`  - Status: ${recentOrder.booking.status}`);
      return;
    }

    console.log('\n❌ No booking record found. Creating one now...');

    // Create the missing booking record
    const newBooking = await prisma.booking.create({
      data: {
        orderId: recentOrder.id,
        orderNumber: recentOrder.orderNumber,
        userId: recentOrder.userId,
        celebrityId: recentOrder.celebrityId,
        message: recentOrder.personalMessage,
        recipientName: recentOrder.recipientName,
        occasion: recentOrder.occasion,
        instructions: recentOrder.specialInstructions || null,
        specialInstructions: recentOrder.specialInstructions || null,
        status: "PENDING", // Booking starts as PENDING until celebrity accepts
        price: recentOrder.totalAmount,
        totalAmount: recentOrder.totalAmount,
        scheduledDate: recentOrder.scheduledDate,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    });

    console.log('\n✅ Booking record created successfully!');
    console.log(`  - Booking ID: ${newBooking.id}`);
    console.log(`  - Status: ${newBooking.status}`);
    console.log(`  - Order Number: ${newBooking.orderNumber}`);
    console.log(`  - Recipient: ${newBooking.recipientName}`);
    console.log(`  - Occasion: ${newBooking.occasion}`);
    console.log(`  - Amount: $${newBooking.totalAmount}`);
    console.log(`  - Deadline: ${newBooking.deadline}`);

    console.log('\n🎉 The booking should now appear in Emma Stone\'s requests!');
    console.log('\n📋 Next steps:');
    console.log('  1. Go to Emma Stone\'s celebrity dashboard');
    console.log('  2. Check the "Requests" tab');
    console.log('  3. You should now see Sarah Johnson Meade\'s booking request');
    console.log('  4. Emma can now Accept or Decline the request');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMissingBooking();

