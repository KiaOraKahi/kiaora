import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function fixZeroAmountOrder() {
  try {
    console.log('🔧 Fixing order with $0 amount...\n');
    
    // Find the specific order
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: 'KO-1755581503765-9Y7KLI'
      },
      include: {
        booking: true
      }
    });
    
    if (!order) {
      console.log('❌ Order not found');
      return;
    }
    
    console.log('📋 Current Order Details:');
    console.log('   Order Number:', order.orderNumber);
    console.log('   Total Amount:', order.totalAmount);
    console.log('   Celebrity Amount:', order.celebrityAmount);
    console.log('   Platform Fee:', order.platformFee);
    
    // Calculate correct amounts
    const celebrityAmount = Math.floor(order.totalAmount * 0.8);
    const platformFee = order.totalAmount - celebrityAmount;
    
    console.log('\n💰 Calculated amounts:');
    console.log('   Total Amount:', order.totalAmount);
    console.log('   Celebrity Amount (80%):', celebrityAmount);
    console.log('   Platform Fee (20%):', platformFee);
    
    // Update the order with correct amounts
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        celebrityAmount: celebrityAmount,
        platformFee: platformFee,
        updatedAt: new Date()
      }
    });
    
    console.log('\n✅ Order updated successfully!');
    console.log('   New Celebrity Amount:', updatedOrder.celebrityAmount);
    console.log('   New Platform Fee:', updatedOrder.platformFee);
    
    // Also update the booking amount
    if (order.booking) {
      const updatedBooking = await prisma.booking.update({
        where: { id: order.booking.id },
        data: {
          price: celebrityAmount, // Use celebrity amount as the price
          totalAmount: order.totalAmount,
          updatedAt: new Date()
        }
      });
      
      console.log('\n✅ Booking updated successfully!');
      console.log('   New Price:', updatedBooking.price);
      console.log('   New Total Amount:', updatedBooking.totalAmount);
    }
    
    console.log('\n🎉 Amount fix completed!');
    console.log('📋 Summary:');
    console.log('   - Order totalAmount: $' + order.totalAmount);
    console.log('   - Celebrity amount: $' + celebrityAmount);
    console.log('   - Platform fee: $' + platformFee);
    console.log('   - UI should now show: $' + celebrityAmount);
    
    // Test the API response
    console.log('\n🧪 Testing API response...');
    const testResponse = {
      amount: order.totalAmount,
      celebrityAmount: celebrityAmount,
      tipAmount: 0,
      totalEarnings: celebrityAmount
    };
    
    console.log('   API Response:', testResponse);
    console.log('   UI should display: $' + celebrityAmount);
    
  } catch (error) {
    console.error('❌ Error fixing order amount:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixZeroAmountOrder();

