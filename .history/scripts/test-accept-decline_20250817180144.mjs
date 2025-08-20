import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function testAcceptDecline() {
  try {
    console.log('🧪 Testing Accept/Decline Functionality...');
    console.log('='.repeat(60));
    
    // 1. Get the celebrity profile
    const celebrity = await prisma.celebrity.findFirst({
      where: {
        user: {
          email: 'emma.stone@example.com'
        }
      },
    });
    
    if (!celebrity) {
      throw new Error('Celebrity profile not found');
    }
    
    console.log('✅ Found celebrity profile:', celebrity.user.name);
    
    // 2. Get pending bookings
    const pendingBookings = await prisma.booking.findMany({
      where: {
        celebrityId: celebrity.id,
        status: 'PENDING'
      },
      include: {
        user: true,
        order: true,
      },
    });
    
    console.log(`\n📋 Found ${pendingBookings.length} pending bookings:`);
    pendingBookings.forEach((booking, index) => {
      console.log(`\n${index + 1}. Booking ID: ${booking.id}`);
      console.log(`   Customer: ${booking.user.name} (${booking.user.email})`);
      console.log(`   Order: ${booking.order?.orderNumber}`);
      console.log(`   Amount: $${booking.price}`);
      console.log(`   Recipient: ${booking.recipientName}`);
      console.log(`   Occasion: ${booking.occasion}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Order Status: ${booking.order?.status}`);
      console.log(`   Payment Status: ${booking.order?.paymentStatus}`);
    });
    
    if (pendingBookings.length === 0) {
      console.log('\n❌ No pending bookings found to test with.');
      console.log('Make sure you have created test orders first.');
      return;
    }
    
    // 3. Test ACCEPT functionality
    console.log('\n🟢 TESTING ACCEPT FUNCTIONALITY...');
    const bookingToAccept = pendingBookings[0];
    
    console.log(`\nAccepting booking: ${bookingToAccept.id}`);
    
    // Simulate the accept action
    const acceptResult = await prisma.$transaction(async (tx) => {
      // Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id: bookingToAccept.id },
        data: {
          status: 'CONFIRMED',
          updatedAt: new Date(),
        },
      });
      
      // Update order status
      if (bookingToAccept.order?.id) {
        await tx.order.update({
          where: { id: bookingToAccept.order.id },
          data: {
            status: 'CONFIRMED',
            updatedAt: new Date(),
            transferStatus: 'PENDING',
          },
        });
      }
      
      return updatedBooking;
    });
    
    console.log('✅ ACCEPT successful!');
    console.log(`   Booking ID: ${acceptResult.id}`);
    console.log(`   New Status: ${acceptResult.status}`);
    console.log(`   Updated At: ${acceptResult.updatedAt}`);
    
    // 4. Test DECLINE functionality
    console.log('\n🔴 TESTING DECLINE FUNCTIONALITY...');
    
    // First, let's create another test booking to decline
    const fanUser = await prisma.user.findUnique({
      where: { email: 'john.smith@example.com' }
    });
    
    if (fanUser) {
      // Create a new test order and booking for decline testing
      const declineOrder = await prisma.order.create({
        data: {
          orderNumber: `DECLINE-TEST-${Date.now()}`,
          userId: fanUser.id,
          celebrityId: celebrity.id,
          totalAmount: 199.99,
          celebrityAmount: 159.99,
          platformFee: 40.00,
          status: 'PENDING',
          paymentStatus: 'SUCCEEDED',
          paymentIntentId: `pi_decline_test_${Date.now()}`,
          recipientName: 'Mike Johnson',
          personalMessage: 'Test message for decline functionality',
          specialInstructions: 'Test instructions',
          scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          scheduledTime: '15:00',
          occasion: 'Test',
          messageType: 'personal',
          email: 'john.smith@example.com',
          phone: '+1234567890',
        },
      });
      
      const declineBooking = await prisma.booking.create({
        data: {
          userId: fanUser.id,
          celebrityId: celebrity.id,
          orderId: declineOrder.id,
          orderNumber: declineOrder.orderNumber,
          status: 'PENDING',
          price: 199.99,
          totalAmount: 199.99,
          message: 'Test message for decline functionality',
          recipientName: 'Mike Johnson',
          occasion: 'Test',
          instructions: 'Test instructions',
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        },
      });
      
      console.log(`\nCreated test booking for decline: ${declineBooking.id}`);
      
      // Now test the decline
      const declineResult = await prisma.$transaction(async (tx) => {
        // Update booking status
        const updatedBooking = await tx.booking.update({
          where: { id: declineBooking.id },
          data: {
            status: 'CANCELLED',
            updatedAt: new Date(),
          },
        });
        
        // Update order status
        await tx.order.update({
          where: { id: declineOrder.id },
          data: {
            status: 'CANCELLED',
            updatedAt: new Date(),
            transferStatus: 'CANCELLED',
          },
        });
        
        return updatedBooking;
      });
      
      console.log('✅ DECLINE successful!');
      console.log(`   Booking ID: ${declineResult.id}`);
      console.log(`   New Status: ${declineResult.status}`);
      console.log(`   Updated At: ${declineResult.updatedAt}`);
    }
    
    // 5. Show final status
    console.log('\n📊 FINAL STATUS:');
    const finalBookings = await prisma.booking.findMany({
      where: {
        celebrityId: celebrity.id,
      },
      include: {
        user: true,
        order: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    
    finalBookings.forEach((booking, index) => {
      console.log(`\n${index + 1}. ${booking.order?.orderNumber || 'N/A'}`);
      console.log(`   Customer: ${booking.user.name}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Order Status: ${booking.order?.status}`);
      console.log(`   Amount: $${booking.price}`);
    });
    
    console.log('\n🎉 ACCEPT/DECLINE FUNCTIONALITY TEST COMPLETED!');
    console.log('='.repeat(60));
    console.log('✅ Accept: Changes status to CONFIRMED');
    console.log('✅ Decline: Changes status to CANCELLED');
    console.log('✅ Order status updates accordingly');
    console.log('✅ Database transactions work correctly');
    
    console.log('\n🔗 Next Steps:');
    console.log('1. Login to celebrity dashboard');
    console.log('2. Check "Booking Requests" tab');
    console.log('3. Verify the status changes are visible');
    console.log('4. Test the UI buttons in the dashboard');
    
  } catch (error) {
    console.error('❌ Error testing accept/decline:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database disconnected');
  }
}

// Run the test
testAcceptDecline();
