import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function debugOrders() {
  try {
    console.log('🔍 Debugging all orders...\n');

    // Find the celebrity user (Emma Stone)
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
      console.log('❌ No celebrity found');
      return;
    }

    console.log(`👤 Found celebrity: ${celebrity.user.name} (ID: ${celebrity.id})\n`);

    // Get all orders for this celebrity
    const orders = await prisma.order.findMany({
      where: {
        celebrityId: celebrity.id
      },
      include: {
        booking: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Found ${orders.length} total orders:\n`);

    orders.forEach((order, index) => {
      console.log(`Order ${index + 1}:`);
      console.log(`  - Order ID: ${order.id}`);
      console.log(`  - Order Number: ${order.orderNumber}`);
      console.log(`  - Status: ${order.status}`);
      console.log(`  - Approval Status: ${order.approvalStatus || 'NULL'}`);
      console.log(`  - Payment Status: ${order.paymentStatus}`);
      console.log(`  - Created: ${order.createdAt}`);
      console.log(`  - Updated: ${order.updatedAt}`);
      if (order.declinedAt) {
        console.log(`  - Declined At: ${order.declinedAt}`);
      }
      console.log('');
    });

    // Check specific conditions
    const pendingApprovalConfirmed = await prisma.order.count({
      where: {
        celebrityId: celebrity.id,
        approvalStatus: 'PENDING_APPROVAL',
        status: 'CONFIRMED'
      }
    });

    const pendingApprovalAny = await prisma.order.count({
      where: {
        celebrityId: celebrity.id,
        approvalStatus: 'PENDING_APPROVAL'
      }
    });

    const cancelledAny = await prisma.order.count({
      where: {
        celebrityId: celebrity.id,
        status: 'CANCELLED'
      }
    });

    console.log('🔍 Specific counts:');
    console.log(`  - Pending Approval + Confirmed: ${pendingApprovalConfirmed}`);
    console.log(`  - Pending Approval (any status): ${pendingApprovalAny}`);
    console.log(`  - Cancelled (any approval status): ${cancelledAny}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugOrders();
