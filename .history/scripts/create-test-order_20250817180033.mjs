import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function createTestOrder() {
  try {
    console.log('🎬 Creating Test Order for Accept/Decline Testing...');
    console.log('='.repeat(60));
    
    // 1. Get or create a test fan user
    let fanUser = await prisma.user.findUnique({
      where: { email: 'john.smith@example.com' }
    });
    
    if (!fanUser) {
      const hashedPassword = await bcrypt.hash('fan123', 12);
      
      fanUser = await prisma.user.create({
        data: {
          name: 'John Smith',
          email: 'john.smith@example.com',
          password: hashedPassword,
          role: 'FAN',
          isVerified: true,
          emailVerified: new Date(),
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        },
      });
      
      console.log('✅ Fan user created successfully!');
    } else {
      console.log('✅ Found existing fan user!');
    }
    
    console.log(`   User ID: ${fanUser.id}`);
    console.log(`   Name: ${fanUser.name}`);
    console.log(`   Email: ${fanUser.email}`);
    console.log(`   Role: ${fanUser.role}`);
    
    // 2. Get the celebrity profile
    const celebrity = await prisma.celebrity.findFirst({
      where: {
        user: {
          email: 'emma.stone@example.com'
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    
    if (!celebrity) {
      throw new Error('Celebrity profile not found');
    }
    
    console.log('✅ Found celebrity profile:');
    console.log(`   Celebrity ID: ${celebrity.id}`);
    console.log(`   Name: ${celebrity.user.name}`);
    console.log(`   Category: ${celebrity.category}`);
    console.log(`   Price: $${celebrity.price}`);
    
    // 3. Create a test order
    const order = await prisma.order.create({
      data: {
        orderNumber: `TEST-${Date.now()}`,
        userId: fanUser.id,
        celebrityId: celebrity.id,
        totalAmount: celebrity.price,
        celebrityAmount: celebrity.price * 0.8, // 80% to celebrity
        platformFee: celebrity.price * 0.2, // 20% platform fee
        status: 'PENDING',
        paymentStatus: 'SUCCEEDED',
        paymentIntentId: `pi_test_${Date.now()}`,
        recipientName: 'Sarah Johnson',
        personalMessage: 'Happy Birthday Sarah! Hope you have an amazing day filled with joy and laughter.',
        specialInstructions: 'Please mention her love for gardening and cats in the message.',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        scheduledTime: '14:00',
        occasion: 'Birthday',
        messageType: 'personal',
        email: 'john.smith@example.com',
        phone: '+1234567890',
      },
    });
    
    console.log('✅ Test order created successfully!');
    console.log(`   Order ID: ${order.id}`);
    console.log(`   Order Number: ${order.orderNumber}`);
    console.log(`   Total Amount: $${order.totalAmount}`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Payment Status: ${order.paymentStatus}`);
    
    // 4. Create a test booking
    const booking = await prisma.booking.create({
      data: {
        userId: fanUser.id,
        celebrityId: celebrity.id,
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: 'PENDING',
        price: celebrity.price,
        totalAmount: celebrity.price,
        message: 'Happy Birthday Sarah! Hope you have an amazing day filled with joy and laughter.',
        recipientName: 'Sarah Johnson',
        occasion: 'Birthday',
        instructions: 'Please mention her love for gardening and cats in the message.',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    });
    
    console.log('✅ Test booking created successfully!');
    console.log(`   Booking ID: ${booking.id}`);
    console.log(`   Status: ${booking.status}`);
    console.log(`   Price: $${booking.price}`);
    console.log(`   Recipient: ${booking.recipientName}`);
    console.log(`   Occasion: ${booking.occasion}`);
    
    // 5. Create a test tip
    const tip = await prisma.tip.create({
      data: {
        userId: fanUser.id,
        celebrityId: celebrity.id,
        orderId: order.id,
        amount: 25.00,
        message: 'Extra special message please!',
        paymentStatus: 'SUCCEEDED',
        paymentIntentId: `pi_tip_${Date.now()}`,
      },
    });
    
    console.log('✅ Test tip created successfully!');
    console.log(`   Tip ID: ${tip.id}`);
    console.log(`   Amount: $${tip.amount}`);
    console.log(`   Message: ${tip.message}`);
    
    // 6. Update order with tip
    await prisma.order.update({
      where: { id: order.id },
      data: {
        totalAmount: order.totalAmount + tip.amount,
        tipAmount: tip.amount,
      },
    });
    
    console.log('✅ Order updated with tip amount!');
    console.log(`   New Total: $${order.totalAmount + tip.amount}`);
    
    // 7. Fetch complete data for verification
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        user: true,
        celebrity: {
          include: {
            user: true,
          },
        },
        booking: true,
        tips: true,
      },
    });
    
    console.log('\n🎉 TEST ORDER CREATED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('📋 Order Details:');
    console.log(`   Order Number: ${completeOrder?.orderNumber}`);
    console.log(`   Customer: ${completeOrder?.user.name} (${completeOrder?.user.email})`);
    console.log(`   Celebrity: ${completeOrder?.celebrity.user.name}`);
    console.log(`   Service: ${completeOrder?.serviceType}`);
    console.log(`   Occasion: ${completeOrder?.occasion}`);
    console.log(`   Recipient: ${completeOrder?.recipientName}`);
    console.log(`   Message: ${completeOrder?.personalMessage}`);
    console.log(`   Base Price: $${completeOrder?.celebrityAmount}`);
    console.log(`   Tip Amount: $${completeOrder?.tipAmount}`);
    console.log(`   Total Amount: $${completeOrder?.totalAmount}`);
    console.log(`   Status: ${completeOrder?.status}`);
    console.log(`   Payment: ${completeOrder?.paymentStatus}`);
    
    console.log('\n🔗 Test Credentials:');
    console.log('Fan User: john.smith@example.com / fan123');
    console.log('Celebrity: emma.stone@example.com / celebrity123');
    
    console.log('\n🧪 Testing Steps:');
    console.log('1. Login as celebrity: emma.stone@example.com / celebrity123');
    console.log('2. Go to celebrity dashboard');
    console.log('3. Check "Booking Requests" tab');
    console.log('4. You should see a pending request from John Smith');
    console.log('5. Test Accept button - should change status to "confirmed"');
    console.log('6. Test Decline button - should change status to "cancelled"');
    console.log('7. Check that order status updates accordingly');
    
    console.log('\n💡 Note: This is a test order with fake payment data.');
    console.log('   In production, real Stripe payment intents would be used.');
    
  } catch (error) {
    console.error('❌ Error creating test order:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database disconnected');
  }
}

// Run the test order creation
createTestOrder();
