import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkSpecificOrder() {
  try {
    console.log('🔍 Checking specific order KO-1755581503765-9Y7KLI...\n');
    
    // Find the specific order
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: 'KO-1755581503765-9Y7KLI'
      },
      include: {
        booking: true,
        items: true,
        user: true,
        celebrity: {
          include: {
            user: true
          }
        },
        tips: {
          where: {
            paymentStatus: "SUCCEEDED"
          }
        }
      }
    });
    
    if (!order) {
      console.log('❌ Order not found');
      return;
    }
    
    console.log('📋 Order Details:');
    console.log('   Order Number:', order.orderNumber);
    console.log('   Total Amount:', order.totalAmount);
    console.log('   Celebrity Amount:', order.celebrityAmount);
    console.log('   Platform Fee:', order.platformFee);
    console.log('   Status:', order.status);
    console.log('   Payment Status:', order.paymentStatus);
    console.log('   Customer:', order.user?.name);
    console.log('   Celebrity:', order.celebrity?.user?.name);
    
    if (order.booking) {
      console.log('\n📋 Booking Details:');
      console.log('   Booking ID:', order.booking.id);
      console.log('   Price:', order.booking.price);
      console.log('   Total Amount:', order.booking.totalAmount);
      console.log('   Status:', order.booking.status);
    }
    
    console.log('\n📦 Order Items:');
    order.items.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name}`);
      console.log(`      Type: ${item.type}`);
      console.log(`      Unit Price: $${item.unitPrice}`);
      console.log(`      Total Price: $${item.totalPrice}`);
      console.log(`      Quantity: ${item.quantity}`);
    });
    
    console.log('\n💝 Tips:');
    if (order.tips.length > 0) {
      order.tips.forEach((tip, index) => {
        console.log(`   ${index + 1}. $${tip.amount} - ${tip.message || 'No message'}`);
      });
    } else {
      console.log('   No tips found');
    }
    
    // Calculate what the API should return
    const totalTips = order.tips.reduce((sum, tip) => sum + tip.amount, 0);
    const amount = order.totalAmount || 0;
    const celebrityAmount = order.celebrityAmount || 0;
    const totalEarnings = celebrityAmount + totalTips;
    
    console.log('\n💰 API Response Calculation:');
    console.log('   Amount (from order.totalAmount):', amount);
    console.log('   Celebrity Amount (from order.celebrityAmount):', celebrityAmount);
    console.log('   Tip Amount (sum of tips):', totalTips);
    console.log('   Total Earnings (celebrityAmount + tips):', totalEarnings);
    
    // Check if the issue is in the frontend calculation
    console.log('\n🔍 Frontend Display Analysis:');
    console.log('   UI should show amount as:', amount);
    console.log('   UI should show celebrity amount as:', celebrityAmount);
    console.log('   UI should show total earnings as:', totalEarnings);
    
    if (amount === 0) {
      console.log('\n❌ ISSUE FOUND: Order totalAmount is 0!');
      console.log('🔧 This means the order was created with 0 amount');
    } else if (celebrityAmount === 0) {
      console.log('\n❌ ISSUE FOUND: Order celebrityAmount is 0!');
      console.log('🔧 This means the celebrity amount was not calculated');
    } else {
      console.log('\n✅ Order amounts look correct');
      console.log('🔍 The issue might be in the frontend display logic');
    }
    
    // Check the booking requests API response format
    console.log('\n📡 Simulating Booking Requests API Response:');
    const apiResponse = {
      id: order.booking?.id || 'N/A',
      orderNumber: order.orderNumber,
      customerName: order.user?.name || 'Unknown',
      amount: amount,
      celebrityAmount: celebrityAmount,
      tipAmount: totalTips,
      totalEarnings: totalEarnings,
      status: order.booking?.status?.toLowerCase() || 'pending',
      approvalStatus: order.approvalStatus?.toLowerCase() || 'pending_approval'
    };
    
    console.log('   API Response:', apiResponse);
    
  } catch (error) {
    console.error('❌ Error checking specific order:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSpecificOrder();
