import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkPendingApproval() {
  try {
    console.log('🔍 Checking pending approval orders...\n');

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

    // Check all orders for this celebrity
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

    // Count by approval status
    const pendingApproval = orders.filter(o => o.approvalStatus === 'PENDING_APPROVAL').length;
    const declined = orders.filter(o => o.approvalStatus === 'DECLINED').length;
    const approved = orders.filter(o => o.approvalStatus === 'APPROVED').length;
    const nullStatus = orders.filter(o => !o.approvalStatus).length;

    console.log('📈 Summary:');
    console.log(`  - Pending Approval: ${pendingApproval}`);
    console.log(`  - Declined: ${declined}`);
    console.log(`  - Approved: ${approved}`);
    console.log(`  - No Approval Status: ${nullStatus}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPendingApproval();
