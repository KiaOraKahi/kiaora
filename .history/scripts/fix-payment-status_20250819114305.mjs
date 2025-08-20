import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function fixPaymentStatus() {
  try {
    console.log('🔧 Fixing payment status for testing...\n');
    
    // Find all orders with PENDING payment status
    const pendingOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PENDING',
        paymentIntentId: {
          not: null
        }
      },
      select: {
        id: true,
        orderNumber: true,
        paymentIntentId: true,
        status: true,
        paymentStatus: true
      }
    });
    
    console.log(`📋 Found ${pendingOrders.length} orders with PENDING payment status\n`);
    
    if (pendingOrders.length === 0) {
      console.log('✅ All orders have correct payment status!');
      return;
    }
    
    // Update all pending orders to SUCCEEDED
    for (const order of pendingOrders) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'SUCCEEDED',
          paidAt: new Date()
        }
      });
      
      console.log(`✅ Fixed: ${order.orderNumber} (${order.paymentIntentId})`);
    }
    
    console.log('\n🎉 Payment status fix completed!');
    console.log('📋 Now you can test accept/decline functionality without webhook errors.');
    
  } catch (error) {
    console.error('❌ Error fixing payment status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPaymentStatus();
