import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testAmountDisplay() {
  try {
    console.log('🧪 Testing amount display fix...\n');
    
    // Find Emma Stone
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

    // Get recent orders with amounts
    const orders = await prisma.order.findMany({
      where: {
        celebrityId: celebrity.id,
        totalAmount: {
          gt: 0
        }
      },
      include: {
        user: true,
        booking: true,
        tips: {
          where: {
            paymentStatus: "SUCCEEDED"
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    console.log(`📋 Found ${orders.length} orders with amounts\n`);

    orders.forEach((order, index) => {
      const totalTips = order.tips.reduce((sum, tip) => sum + tip.amount, 0);
      const celebrityAmount = order.celebrityAmount || 0;
      const totalEarnings = celebrityAmount + totalTips;

      console.log(`${index + 1}. Order: ${order.orderNumber}`);
      console.log(`   Customer: ${order.user?.name}`);
      console.log(`   Total Amount: $${order.totalAmount}`);
      console.log(`   Celebrity Amount: $${celebrityAmount}`);
      console.log(`   Platform Fee: $${order.platformFee || 0}`);
      console.log(`   Tips: $${totalTips}`);
      console.log(`   Total Earnings: $${totalEarnings}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Payment Status: ${order.paymentStatus}`);
      console.log('');
    });

    // Test the specific order from the image
    const specificOrder = await prisma.order.findFirst({
      where: {
        orderNumber: 'KO-1755581503765-9Y7KLI'
      },
      include: {
        user: true,
        booking: true,
        tips: {
          where: {
            paymentStatus: "SUCCEEDED"
          }
        }
      }
    });

    if (specificOrder) {
      const totalTips = specificOrder.tips.reduce((sum, tip) => sum + tip.amount, 0);
      const celebrityAmount = specificOrder.celebrityAmount || 0;
      const totalEarnings = celebrityAmount + totalTips;

      console.log('🎯 Specific Order Test (KO-1755581503765-9Y7KLI):');
      console.log(`   Total Amount: $${specificOrder.totalAmount}`);
      console.log(`   Celebrity Amount: $${celebrityAmount}`);
      console.log(`   Tips: $${totalTips}`);
      console.log(`   Total Earnings: $${totalEarnings}`);
      console.log(`   UI should display: $${celebrityAmount}`);
      
      if (celebrityAmount > 0) {
        console.log('   ✅ Amount should now display correctly!');
      } else {
        console.log('   ❌ Amount is still 0 - issue not fixed');
      }
    }

    console.log('\n🎉 Amount display test completed!');
    console.log('📋 Next steps:');
    console.log('   1. Check the celebrity dashboard');
    console.log('   2. Verify that amounts are now showing correctly');
    console.log('   3. Test the accept/decline functionality');

  } catch (error) {
    console.error('❌ Error testing amount display:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAmountDisplay();
