import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function fixAllZeroAmountOrders() {
  try {
    console.log('🔧 Fixing all orders with null celebrity amounts...\n');
    
    // Find all orders with null celebrity amounts
    const ordersWithNullAmounts = await prisma.order.findMany({
      where: {
        celebrityAmount: null,
        totalAmount: {
          gt: 0 // Only orders with actual amounts
        }
      },
      include: {
        booking: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📋 Found ${ordersWithNullAmounts.length} orders with null celebrity amounts\n`);
    
    if (ordersWithNullAmounts.length === 0) {
      console.log('✅ No orders with null celebrity amounts found!');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const order of ordersWithNullAmounts) {
      try {
        console.log(`🔧 Fixing order: ${order.orderNumber}`);
        console.log(`   Total Amount: $${order.totalAmount}`);
        
        // Calculate correct amounts
        const celebrityAmount = Math.floor(order.totalAmount * 0.8);
        const platformFee = order.totalAmount - celebrityAmount;
        
        // Update the order
        await prisma.order.update({
          where: { id: order.id },
          data: {
            celebrityAmount: celebrityAmount,
            platformFee: platformFee,
            updatedAt: new Date()
          }
        });
        
        // Update the booking if it exists
        if (order.booking) {
          await prisma.booking.update({
            where: { id: order.booking.id },
            data: {
              price: celebrityAmount,
              totalAmount: order.totalAmount,
              updatedAt: new Date()
            }
          });
        }
        
        console.log(`   ✅ Fixed: Celebrity Amount = $${celebrityAmount}, Platform Fee = $${platformFee}`);
        successCount++;
        
      } catch (error) {
        console.error(`   ❌ Failed to fix order ${order.orderNumber}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Successfully fixed: ${successCount} orders`);
    console.log(`   ❌ Failed to fix: ${errorCount} orders`);
    console.log(`   📋 Total processed: ${ordersWithNullAmounts.length} orders`);
    
    if (successCount > 0) {
      console.log('\n🎉 Amount fix completed!');
      console.log('📋 Next steps:');
      console.log('   1. Check the celebrity dashboard');
      console.log('   2. Verify that orders now show correct amounts');
      console.log('   3. Test accept/decline functionality');
    }
    
  } catch (error) {
    console.error('❌ Error fixing orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllZeroAmountOrders();
