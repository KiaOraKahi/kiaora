import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createNewRequest() {
  try {
    console.log('🎬 Creating new booking request for Emma Stone...\n');

    // Find Emma Stone celebrity
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

    // Create a new fan user for this request
    const fanUser = await prisma.user.upsert({
      where: { email: 'sarah.wilson@example.com' },
      update: {},
      create: {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', // password: 123456
        role: 'FAN',
        image: null,
        emailVerified: new Date(),
      }
    });

    console.log(`👤 Created/Found fan user: ${fanUser.name} (ID: ${fanUser.id})\n`);

    // Create a new order
    const orderNumber = `REQ-${Date.now()}`;
    const basePrice = 100; // Set a fixed base price since celebrity.pricePersonal might be null
    
    console.log(`💰 Using base price: $${basePrice}`);
    
    const order = await prisma.order.create({
      data: {
        orderNumber,
        celebrityId: celebrity.id,
        userId: fanUser.id,
        totalAmount: basePrice,
        celebrityAmount: basePrice * 0.8, // 80% to celebrity
        platformFee: basePrice * 0.2, // 20% platform fee
        paymentStatus: 'SUCCEEDED',
        status: 'PENDING',
        messageType: 'personal',
        recipientName: 'Michael Wilson',
        occasion: 'Birthday',
        personalMessage: 'Please create a special birthday message for my husband Michael. He loves your movies and would be thrilled to receive a personalized message from you!',
        specialInstructions: 'Please make it extra special and mention how much he loves your work!',
        email: 'sarah.wilson@example.com',
        phone: '+1234567890',
        paymentIntentId: `pi_test_${Date.now()}`,
      }
    });

    console.log(`📦 Created order: ${order.orderNumber} (ID: ${order.id})\n`);

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        celebrityId: celebrity.id,
        userId: fanUser.id,
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalAmount: basePrice,
        recipientName: 'Michael Wilson',
        occasion: 'Birthday',
        instructions: 'Please create a special birthday message for my husband Michael. He loves your movies and would be thrilled to receive a personalized message from you!',
        status: 'PENDING',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      }
    });

    console.log(`📋 Created booking: ${booking.id}\n`);

    // Create a tip
    const tip = await prisma.tip.create({
      data: {
        orderId: order.id,
        celebrityId: celebrity.id,
        userId: fanUser.id,
        amount: 25, // $25 tip
        message: 'Thank you so much for doing this! Michael will be so surprised!',
        paymentStatus: 'SUCCEEDED',
      }
    });

    console.log(`💝 Created tip: $${tip.amount} (ID: ${tip.id})\n`);

    // Update order with tip amount
    await prisma.order.update({
      where: { id: order.id },
      data: {
        totalAmount: basePrice + tip.amount,
        celebrityAmount: (basePrice + tip.amount) * 0.8,
        platformFee: (basePrice + tip.amount) * 0.2,
      }
    });

    console.log('✅ Successfully created new booking request!');
    console.log('\n📊 Summary:');
    console.log(`  - Order: ${order.orderNumber}`);
    console.log(`  - Customer: ${fanUser.name}`);
    console.log(`  - Recipient: Michael Wilson`);
    console.log(`  - Occasion: Birthday`);
    console.log(`  - Base Price: $${basePrice}`);
    console.log(`  - Tip: $${tip.amount}`);
    console.log(`  - Total: $${basePrice + tip.amount}`);
    console.log(`  - Status: PENDING (waiting for Emma to accept/decline)`);

    console.log('\n🎯 Next steps:');
    console.log('  1. Go to Emma\'s celebrity dashboard');
    console.log('  2. Check the "Requests" tab');
    console.log('  3. You should see this new request with Accept/Decline buttons');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createNewRequest();
