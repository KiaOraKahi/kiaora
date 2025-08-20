import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testWebhookManually() {
  try {
    console.log('🧪 Testing webhook manually...\n');
    
    // Find orders with PENDING payment status
    const pendingOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PENDING',
        paymentIntentId: {
          not: null
        }
      },
      include: {
        booking: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });
    
    console.log(`📋 Found ${pendingOrders.length} orders with PENDING payment status\n`);
    
    if (pendingOrders.length === 0) {
      console.log('✅ No pending orders found');
      return;
    }
    
    for (const order of pendingOrders) {
      console.log(`🔧 Processing order: ${order.orderNumber}`);
      console.log(`   Payment Intent: ${order.paymentIntentId}`);
      console.log(`   Current Status: ${order.status}`);
      console.log(`   Payment Status: ${order.paymentStatus}`);
      
      // Manually update payment status to SUCCEEDED (simulating webhook)
      try {
        const updatedOrder = await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'SUCCEEDED',
            paidAt: new Date(),
            // Keep order status as is (don't change if already CONFIRMED)
            status: order.status === 'CONFIRMED' ? 'CONFIRMED' : 'PENDING'
          }
        });
        
        console.log(`   ✅ Updated payment status to: ${updatedOrder.paymentStatus}`);
        console.log(`   ✅ Paid at: ${updatedOrder.paidAt}`);
        
      } catch (error) {
        console.log(`   ❌ Failed to update: ${error.message}`);
      }
      
      console.log('');
    }
    
    console.log('🎉 Manual webhook test completed!');
    console.log('📋 Next steps:');
    console.log('   1. Add STRIPE_WEBHOOK_SECRET to .env file');
    console.log('   2. Configure webhook endpoint in Stripe Dashboard');
    console.log('   3. Test with real webhook events');
    
  } catch (error) {
    console.error('❌ Error testing webhook manually:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testWebhookManually();
