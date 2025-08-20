import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testAcceptDeclineImmediate() {
  try {
    console.log('🧪 Testing accept/decline immediate response...\n');

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

    // Find a PENDING booking to test with
    const pendingBooking = await prisma.booking.findFirst({
      where: {
        celebrityId: celebrity.id,
        status: 'PENDING'
      },
      include: {
        order: {
          include: {
            user: true
          }
        }
      }
    });

    if (!pendingBooking) {
      console.log('❌ No PENDING bookings found for testing');
      return;
    }

    console.log('📋 Found PENDING booking for testing:');
    console.log(`   - Booking ID: ${pendingBooking.id}`);
    console.log(`   - Order Number: ${pendingBooking.orderNumber}`);
    console.log(`   - Customer: ${pendingBooking.order?.user?.name}`);
    console.log(`   - Current Status: ${pendingBooking.status}`);
    console.log(`   - Order Status: ${pendingBooking.order?.status}`);

    // Test 1: ACCEPT action
    console.log('\n🟢 TESTING ACCEPT ACTION...');
    
    const startTime = Date.now();
    
    const acceptResult = await prisma.$transaction(async (tx) => {
      // Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id: pendingBooking.id },
        data: {
          status: 'CONFIRMED',
          updatedAt: new Date(),
        },
        include: {
          order: true
        }
      });
      
      // Update order status
      if (pendingBooking.order?.id) {
        await tx.order.update({
          where: { id: pendingBooking.order.id },
          data: {
            status: 'CONFIRMED',
            updatedAt: new Date(),
            transferStatus: 'PENDING',
            approvalStatus: 'PENDING_APPROVAL',
          },
        });
      }
      
      return updatedBooking;
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('✅ ACCEPT completed!');
    console.log(`   - Response Time: ${responseTime}ms`);
    console.log(`   - Booking Status: ${acceptResult.status}`);
    console.log(`   - Order Status: ${acceptResult.order?.status}`);
    console.log(`   - Updated At: ${acceptResult.updatedAt}`);

    // Test 2: DECLINE action (reset to PENDING first)
    console.log('\n🔴 TESTING DECLINE ACTION...');
    
    // Reset to PENDING first
    await prisma.booking.update({
      where: { id: pendingBooking.id },
      data: {
        status: 'PENDING',
        updatedAt: new Date(),
      },
    });
    
    if (pendingBooking.order?.id) {
      await prisma.order.update({
        where: { id: pendingBooking.order.id },
        data: {
          status: 'PENDING',
          updatedAt: new Date(),
          transferStatus: 'PENDING',
          approvalStatus: 'PENDING_APPROVAL',
        },
      });
    }
    
    const declineStartTime = Date.now();
    
    const declineResult = await prisma.$transaction(async (tx) => {
      // Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id: pendingBooking.id },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date(),
        },
        include: {
          order: true
        }
      });
      
      // Update order status
      if (pendingBooking.order?.id) {
        await tx.order.update({
          where: { id: pendingBooking.order.id },
          data: {
            status: 'CANCELLED',
            updatedAt: new Date(),
            transferStatus: 'CANCELLED',
            approvalStatus: 'DECLINED',
            declinedAt: new Date(),
          },
        });
      }
      
      return updatedBooking;
    });
    
    const declineEndTime = Date.now();
    const declineResponseTime = declineEndTime - declineStartTime;
    
    console.log('✅ DECLINE completed!');
    console.log(`   - Response Time: ${declineResponseTime}ms`);
    console.log(`   - Booking Status: ${declineResult.status}`);
    console.log(`   - Order Status: ${declineResult.order?.status}`);
    console.log(`   - Updated At: ${declineResult.updatedAt}`);

    // Test 3: Verify immediate state changes
    console.log('\n📊 VERIFYING IMMEDIATE STATE CHANGES...');
    
    const finalBooking = await prisma.booking.findUnique({
      where: { id: pendingBooking.id },
      include: {
        order: true
      }
    });
    
    console.log('📋 Final State:');
    console.log(`   - Booking Status: ${finalBooking?.status}`);
    console.log(`   - Order Status: ${finalBooking?.order?.status}`);
    console.log(`   - Approval Status: ${finalBooking?.order?.approvalStatus}`);
    console.log(`   - Transfer Status: ${finalBooking?.order?.transferStatus}`);

    // Performance summary
    console.log('\n📈 PERFORMANCE SUMMARY:');
    console.log(`   - Accept Response Time: ${responseTime}ms`);
    console.log(`   - Decline Response Time: ${declineResponseTime}ms`);
    console.log(`   - Average Response Time: ${(responseTime + declineResponseTime) / 2}ms`);
    
    if (responseTime < 1000 && declineResponseTime < 1000) {
      console.log('✅ Response times are excellent (< 1 second)');
    } else if (responseTime < 2000 && declineResponseTime < 2000) {
      console.log('⚠️ Response times are acceptable (< 2 seconds)');
    } else {
      console.log('❌ Response times are too slow (> 2 seconds)');
    }

    console.log('\n🎉 Accept/Decline immediate response test completed!');

  } catch (error) {
    console.error('❌ Error testing accept/decline immediate response:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAcceptDeclineImmediate();
