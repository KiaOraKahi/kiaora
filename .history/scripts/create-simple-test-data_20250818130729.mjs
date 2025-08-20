import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createSimpleTestData() {
  try {
    console.log('🔄 Creating simple test data for payout balance and tip reports...');

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

    // Create test tips directly
    const testTips = [
      {
        amount: 5000, // $50.00 tip
        message: 'Great video! Thank you!',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      },
      {
        amount: 10000, // $100.00 tip
        message: 'Amazing work!',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        amount: 2500, // $25.00 tip
        message: 'Love it!',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      }
    ];

    // Create test tips
    for (const tipData of testTips) {
      const tip = await prisma.tip.create({
        data: {
          userId: emmaStone.userId,
          celebrityId: emmaStone.id,
          amount: tipData.amount,
          message: tipData.message,
          status: tipData.status,
          createdAt: tipData.createdAt,
        }
      });

      console.log(`✅ Created tip: $${tip.amount / 100} - ${tip.message}`);
    }

    console.log('🎉 Simple test data created successfully!');
    console.log('\n📊 Summary:');
    console.log('- 3 test tips created');
    console.log('- Total tips: $175.00');

  } catch (error) {
    console.error('❌ Error creating simple test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSimpleTestData();
