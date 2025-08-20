import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function fixPendingApproval() {
  try {
    console.log('🔧 Fixing pending approval status...\n');

    // Find the celebrity user (Emma Stone)
    const celebrity = await prisma.celebrity.findFirst({
      where: {
        user: {
          name: {
            contains: 'Emma',
            mode: 'insensitive'
          }
        }
      }
    });

    if (!celebrity) {
      console.log('❌ No celebrity found');
      return;
    }

    console.log(`👤 Found celebrity: ${celebrity.user.name} (ID: ${celebrity.id})\n`);

    // Find orders that are cancelled but still have PENDING_APPROVAL status
    const ordersToFix = await prisma.order.findMany({
      where: {
        celebrityId: celebrity.id,
        status: 'CANCELLED',
        approvalStatus: 'PENDING_APPROVAL'
      }
    });

    console.log(`🔍 Found ${ordersToFix.length} orders that need fixing:\n`);

    for (const order of ordersToFix) {
      console.log(`Fixing order: ${order.orderNumber}`);
      
      // Update the approval status to DECLINED
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          approvalStatus: 'DECLINED',
          declinedAt: new Date()
        }
      });

      console.log(`✅ Updated order ${order.orderNumber} to DECLINED`);
    }

    // Now check the current status
    const pendingApproval = await prisma.order.count({
      where: {
        celebrityId: celebrity.id,
        approvalStatus: 'PENDING_APPROVAL',
        status: 'CONFIRMED'
      }
    });

    const declined = await prisma.order.count({
      where: {
        celebrityId: celebrity.id,
        approvalStatus: 'DECLINED'
      }
    });

    console.log('\n📊 Current status:');
    console.log(`  - Pending Approval: ${pendingApproval}`);
    console.log(`  - Declined: ${declined}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPendingApproval();
