import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkPaymentWebhook() {
  try {
    console.log('🔍 Checking payment webhook status...\n');
    
    // Find the specific order
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: 'KO-1755581503765-9Y7KLI'
      }
    });
    
    if (!order) {
      console.log('❌ Order not found');
      return;
    }
    
    console.log('📋 Order Payment Details:');
    console.log('   Order Number:', order.orderNumber);
    console.log('   Payment Status:', order.paymentStatus);
    console.log('   Payment Intent ID:', order.paymentIntentId || 'NULL');
    console.log('   Order Status:', order.status);
    console.log('   Paid At:', order.paidAt || 'NULL');
    console.log('   Created At:', order.createdAt);
    
    // Check if there are any recent orders with SUCCEEDED payment status
    console.log('\n📊 Recent Orders Payment Status:');
    const recentOrders = await prisma.order.findMany({
      where: {
        paymentStatus: {
          in: ['PENDING', 'SUCCEEDED', 'FAILED']
        }
      },
      select: {
        orderNumber: true,
        paymentStatus: true,
        paymentIntentId: true,
        status: true,
        paidAt: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    
    recentOrders.forEach((order, index) => {
      console.log(`   ${index + 1}. ${order.orderNumber}`);
      console.log(`      Payment Status: ${order.paymentStatus}`);
      console.log(`      Payment Intent: ${order.paymentIntentId || 'NULL'}`);
      console.log(`      Order Status: ${order.status}`);
      console.log(`      Paid At: ${order.paidAt || 'NULL'}`);
      console.log('');
    });
    
    // Check webhook configuration
    console.log('🔧 Webhook Configuration:');
    console.log('   STRIPE_WEBHOOK_SECRET exists:', !!process.env.STRIPE_WEBHOOK_SECRET);
    console.log('   STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
    
    if (order.paymentIntentId) {
      console.log('\n🎯 Payment Intent Analysis:');
      console.log('   Payment Intent ID:', order.paymentIntentId);
      console.log('   Current Payment Status:', order.paymentStatus);
      
      if (order.paymentStatus === 'PENDING') {
        console.log('   ❌ ISSUE: Payment is still PENDING but order was accepted');
        console.log('   🔧 This suggests the webhook never processed successfully');
        console.log('   📋 Possible causes:');
        console.log('      1. Webhook endpoint not configured in Stripe');
        console.log('      2. Webhook failed to process');
        console.log('      3. Payment intent ID mismatch');
        console.log('      4. Webhook secret incorrect');
      } else if (order.paymentStatus === 'SUCCEEDED') {
        console.log('   ✅ Payment status is correct');
      }
    } else {
      console.log('\n❌ ISSUE: No Payment Intent ID found');
      console.log('   🔧 This suggests the order was created without a payment intent');
      console.log('   📋 This could happen if:');
      console.log('      1. Order was created manually');
      console.log('      2. Payment intent creation failed');
      console.log('      3. Database issue');
    }
    
    // Check if there are any webhook logs or errors
    console.log('\n📋 Webhook Debugging Steps:');
    console.log('   1. Check Stripe Dashboard > Webhooks');
    console.log('   2. Verify webhook endpoint is configured');
    console.log('   3. Check webhook delivery logs');
    console.log('   4. Verify webhook secret matches');
    console.log('   5. Test webhook endpoint manually');
    
  } catch (error) {
    console.error('❌ Error checking payment webhook:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPaymentWebhook();
