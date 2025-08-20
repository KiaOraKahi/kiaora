import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createTestPayments() {
  try {
    console.log('🔄 Creating test payment data...');

    // Get Emma Stone's celebrity profile
    const emmaStone = await prisma.celebrity.findFirst({
      where: { user: { name: { contains: 'Emma' } } },
      include: { user: true }
    });

    if (!emmaStone) {
      console.error('❌ Emma Stone not found');
      return;
    }

    console.log('✅ Found Emma Stone:', emmaStone.user.name);

    // Create test orders with different statuses
    const testOrders = [
      {
        orderNumber: 'TEST-001',
        totalAmount: 29900, // $299.00
        celebrityAmount: 23920, // 80% of $299
        platformFee: 5980, // 20% of $299
        status: 'CONFIRMED',
        paymentStatus: 'SUCCEEDED',
        approvalStatus: 'APPROVED',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        orderNumber: 'TEST-002',
        totalAmount: 59900, // $599.00
        celebrityAmount: 47920, // 80% of $599
        platformFee: 11980, // 20% of $599
        status: 'CONFIRMED',
        paymentStatus: 'SUCCEEDED',
        approvalStatus: 'APPROVED',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        orderNumber: 'TEST-003',
        totalAmount: 19900, // $199.00
        celebrityAmount: 15920, // 80% of $199
        platformFee: 3980, // 20% of $199
        status: 'PENDING',
        paymentStatus: 'SUCCEEDED',
        approvalStatus: null,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      }
    ];

    // Create test orders
    for (const orderData of testOrders) {
      const order = await prisma.order.create({
        data: {
          orderNumber: orderData.orderNumber,
          userId: emmaStone.userId,
          celebrityId: emmaStone.id,
          totalAmount: orderData.totalAmount,
          celebrityAmount: orderData.celebrityAmount,
          platformFee: orderData.platformFee,
          status: orderData.status,
          paymentStatus: orderData.paymentStatus,
          approvalStatus: orderData.approvalStatus,
          personalMessage: 'Test message for ' + orderData.orderNumber,
          recipientName: 'Test Recipient',
          occasion: 'Birthday',
          specialInstructions: 'Test instructions',
          messageType: 'VIDEO',
          createdAt: orderData.createdAt,
        }
      });

      console.log(`✅ Created order: ${order.orderNumber} - $${order.totalAmount / 100}`);

      // Create corresponding booking for confirmed orders
      if (order.status === 'CONFIRMED') {
        await prisma.booking.create({
          data: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            userId: order.userId,
            celebrityId: order.celebrityId,
            message: order.personalMessage,
            recipientName: order.recipientName,
            occasion: order.occasion,
            instructions: order.specialInstructions,
            price: order.celebrityAmount,
            totalAmount: order.totalAmount,
            status: 'CONFIRMED',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            createdAt: order.createdAt,
          }
        });
        console.log(`✅ Created booking for order: ${order.orderNumber}`);
      }
    }

    // Create test tips
    const testTips = [
      {
        orderNumber: 'TEST-001',
        amount: 5000, // $50.00 tip
        status: 'PENDING',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      },
      {
        orderNumber: 'TEST-002',
        amount: 10000, // $100.00 tip
        status: 'PENDING',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        orderNumber: 'TEST-001',
        amount: 2500, // $25.00 tip
        status: 'PENDING',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      }
    ];

    // Create test tips
    for (const tipData of testTips) {
      const order = await prisma.order.findFirst({
        where: { orderNumber: tipData.orderNumber }
      });

      if (order) {
        const tip = await prisma.tip.create({
          data: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            userId: order.userId,
            celebrityId: order.celebrityId,
            amount: tipData.amount,
            message: `Test tip for ${tipData.orderNumber}`,
            status: tipData.status,
            createdAt: tipData.createdAt,
          }
        });

        console.log(`✅ Created tip: $${tip.amount / 100} for order ${tip.orderNumber}`);
      }
    }

    console.log('🎉 Test payment data created successfully!');
    console.log('\n📊 Summary:');
    console.log('- 3 test orders created');
    console.log('- 2 confirmed bookings');
    console.log('- 3 test tips created');
    console.log('- Total earnings: $877.00');
    console.log('- Total tips: $175.00');

  } catch (error) {
    console.error('❌ Error creating test payments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestPayments();
