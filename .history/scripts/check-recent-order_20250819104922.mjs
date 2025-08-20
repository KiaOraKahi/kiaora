import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkRecentOrder() {
  try {
    console.log('🔍 Checking most recent order details...\n');

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
    console.log(`  - Customer Email: ${recentOrder.user?.email || 'N/A'}`);
    console.log(`  - Status: ${recentOrder.status}`);
    console.log(`  - Approval Status: ${recentOrder.approvalStatus || 'NULL'}`);
    console.log(`  - Payment Status: ${recentOrder.paymentStatus}`);
    console.log(`  - Amount: $${recentOrder.totalAmount}`);
    console.log(`  - Created: ${recentOrder.createdAt}`);
    console.log(`  - Updated: ${recentOrder.updatedAt}`);

    if (recentOrder.booking) {
      console.log('\n📝 Booking Details:');
      console.log(`  - Booking ID: ${recentOrder.booking.id}`);
      console.log(`  - Recipient Name: ${recentOrder.booking.recipientName || 'N/A'}`);
      console.log(`  - Occasion: ${recentOrder.booking.occasion || 'N/A'}`);
      console.log(`  - Instructions: ${recentOrder.booking.instructions || 'N/A'}`);
      console.log(`  - Requested Date: ${recentOrder.booking.requestedDate || 'N/A'}`);
    }

    // Check if this matches Sarah Johnson Meade
    const customerName = recentOrder.user?.name || '';
    if (customerName.toLowerCase().includes('sarah') || 
        customerName.toLowerCase().includes('johnson') || 
        customerName.toLowerCase().includes('meade')) {
      console.log('\n✅ This appears to be the order from Sarah Johnson Meade!');
    } else {
      console.log('\n❌ This order is NOT from Sarah Johnson Meade');
      console.log(`   Customer name: "${customerName}"`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentOrder();
