import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function fixAllMissingBookings() {
  try {
    console.log('🔧 Fixing all missing booking records...\n');

    // Find all orders without booking records
    const ordersWithoutBookings = await prisma.order.findMany({
      where: {
        booking: null,
        // Only include orders that should have bookings
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED']
        }
      },
      include: {
        user: true,
        celebrity: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📋 Found ${ordersWithoutBookings.length} orders without booking records\n`);

    if (ordersWithoutBookings.length === 0) {
      console.log('✅ No missing booking records found!');
      return;
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const order of ordersWithoutBookings) {
      try {
        console.log(`🔧 Creating booking for order: ${order.orderNumber}`);
        console.log(`   Customer: ${order.user?.name || 'Unknown'}`);
        console.log(`   Celebrity: ${order.celebrity?.user?.name || 'Unknown'}`);
        console.log(`   Amount: $${order.totalAmount}`);
        console.log(`   Status: ${order.status}`);

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
          },
        });

        console.log(`✅ Created booking: ${booking.id}\n`);
        
        results.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          bookingId: booking.id,
          customerName: order.user?.name,
          celebrityName: order.celebrity?.user?.name,
          status: 'created'
        });
        
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to create booking for order ${order.orderNumber}:`, error.message);
        
        results.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: order.user?.name,
          celebrityName: order.celebrity?.user?.name,
          error: error.message,
          status: 'failed'
        });
        
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Successfully created: ${successCount} bookings`);
    console.log(`   ❌ Failed to create: ${errorCount} bookings`);
    console.log(`   📋 Total processed: ${ordersWithoutBookings.length} orders`);

    if (errorCount > 0) {
      console.log('\n❌ Failed bookings:');
      results.filter(r => r.status === 'failed').forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.orderNumber} - ${result.error}`);
      });
    }

    console.log('\n🎉 Booking record fix completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Check the celebrity dashboards');
    console.log('   2. Verify that all booking requests are now visible');
    console.log('   3. Test the booking approval/decline functionality');

  } catch (error) {
    console.error('❌ Error fixing missing booking records:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllMissingBookings();

