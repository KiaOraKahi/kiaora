import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testAcceptBooking() {
  try {
    console.log('🧪 Testing accept booking functionality...\n');
    
    // Find the specific order
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: 'KO-1755581503765-9Y7KLI'
      },
      include: {
        booking: true,
        user: true,
        celebrity: {
          include: {
            user: true
          }
        }
      }
    });
    
    if (!order) {
      console.log('❌ Order not found');
      return;
    }
    
    console.log('📋 Current Order State:');
    console.log('   Order Number:', order.orderNumber);
    console.log('   Order Status:', order.status);
    console.log('   Payment Status:', order.paymentStatus);
    console.log('   Approval Status:', order.approvalStatus);
    console.log('   Customer:', order.user?.name);
    console.log('   Celebrity:', order.celebrity?.user?.name);
    
    if (order.booking) {
      console.log('\n📋 Current Booking State:');
      console.log('   Booking ID:', order.booking.id);
      console.log('   Booking Status:', order.booking.status);
      console.log('   Price:', order.booking.price);
    }
    
    // Test the accept logic
    console.log('\n🔍 Testing Accept Logic:');
    const paymentStatus = order.paymentStatus || '';
    const validStatuses = ["PENDING", "SUCCEEDED"];
    const canAccept = validStatuses.includes(paymentStatus);
    
    console.log('   Payment Status:', paymentStatus);
    console.log('   Valid Statuses:', validStatuses);
    console.log('   Can Accept:', canAccept);
    
    if (canAccept) {
      console.log('   ✅ Order can be accepted!');
      
      // Simulate the accept action
      console.log('\n🔄 Simulating Accept Action...');
      
      const result = await prisma.$transaction(async (tx) => {
        // Update booking status
        const updatedBooking = await tx.booking.update({
          where: { id: order.booking.id },
          data: {
            status: 'CONFIRMED',
            updatedAt: new Date(),
          },
        });
        
        // Update order status
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'CONFIRMED',
            updatedAt: new Date(),
            transferStatus: 'PENDING',
            approvalStatus: 'PENDING_APPROVAL',
          },
        });
        
        return updatedBooking;
      });
      
      console.log('✅ Accept action completed successfully!');
      console.log('   New Booking Status:', result.status);
      
      // Verify the changes
      const updatedOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: { booking: true }
      });
      
      console.log('\n📋 Updated Order State:');
      console.log('   Order Status:', updatedOrder?.status);
      console.log('   Approval Status:', updatedOrder?.approvalStatus);
      console.log('   Transfer Status:', updatedOrder?.transferStatus);
      console.log('   Booking Status:', updatedOrder?.booking?.status);
      
    } else {
      console.log('   ❌ Order cannot be accepted with current payment status');
    }
    
    console.log('\n🎉 Accept booking test completed!');
    
  } catch (error) {
    console.error('❌ Error testing accept booking:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAcceptBooking();
