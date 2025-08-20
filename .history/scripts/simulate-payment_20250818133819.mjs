import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function simulatePayment() {
  try {
    console.log('🎬 Simulating a payment for Emma Stone...');

    // Get Emma Stone's celebrity record
    const emmaStone = await prisma.celebrity.findFirst({
      where: {
        user: {
          name: {
            contains: 'Emma Stone',
            mode: 'insensitive'
          }
        }
      },
      include: {
        user: true
      }
    });

    if (!emmaStone) {
      console.error('❌ Emma Stone not found in database');
      return;
    }

    console.log('✅ Found Emma Stone:', emmaStone.user.name);

    // Get a test user (Sarah Johnson)
    const testUser = await prisma.user.findFirst({
      where: {
        email: 'sarah.johnson@example.com'
      }
    });

    if (!testUser) {
      console.error('❌ Test user (Sarah Johnson) not found');
      return;
    }

    console.log('✅ Found test user:', testUser.name);

    // Create a simulated order
    const orderNumber = `REQ-${Date.now()}`;
    const totalAmount = 299000; // $2,990.00
    const platformFee = 59800; // $598.00 (20%)
    const celebrityAmount = totalAmount - platformFee; // $2,392.00

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: testUser.id,
        celebrityId: emmaStone.id,
        totalAmount,
        celebrityAmount,
        platformFee,
        paymentStatus: 'SUCCEEDED',
        status: 'CONFIRMED',
        messageType: 'PERSONAL',
        email: testUser.email,
        personalMessage: 'Hi Emma! This is a test payment simulation. Thank you for your amazing work!',
        recipientName: 'Test Recipient',
        occasion: 'Test Occasion',
        specialInstructions: 'This is a simulated payment for testing purposes.',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('✅ Created order:', order.orderNumber);

    // Create a booking record
    const booking = await prisma.booking.create({
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: testUser.id,
        celebrityId: emmaStone.id,
        message: order.personalMessage,
        recipientName: order.recipientName,
        occasion: order.occasion,
        instructions: order.specialInstructions,
        price: celebrityAmount,
        totalAmount: totalAmount,
        status: 'COMPLETED',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('✅ Created booking:', booking.id);

    // Create a payout record
    const payout = await prisma.payout.create({
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        celebrityId: emmaStone.id,
        amount: celebrityAmount,
        platformFee: platformFee,
        status: 'PAID',
        paidAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('✅ Created payout:', payout.id);

    // Create a tip record
    const tip = await prisma.tip.create({
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: testUser.id,
        celebrityId: emmaStone.id,
        amount: 5000, // $50.00 tip
        message: 'Great work! Here\'s a tip for the excellent service!',
        status: 'PAID',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('✅ Created tip:', tip.id);

    console.log('\n🎉 Payment simulation completed successfully!');
    console.log('📊 Summary:');
    console.log(`   Order: ${order.orderNumber}`);
    console.log(`   Total Amount: $${(totalAmount / 100).toFixed(2)}`);
    console.log(`   Platform Fee: $${(platformFee / 100).toFixed(2)}`);
    console.log(`   Celebrity Payout: $${(celebrityAmount / 100).toFixed(2)}`);
    console.log(`   Tip: $${(tip.amount / 100).toFixed(2)}`);
    console.log('\n💡 Check Emma Stone\'s payout dashboard to see the new earnings!');

  } catch (error) {
    console.error('❌ Error simulating payment:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simulatePayment();
