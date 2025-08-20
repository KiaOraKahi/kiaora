import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkCurrentData() {
  try {
    console.log('🔍 Checking current payment data...');

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

    // Check existing orders
    const orders = await prisma.order.findMany({
      where: { celebrityId: emmaStone.id },
      include: { tips: true }
    });

    console.log(`\n📦 Orders found: ${orders.length}`);
    orders.forEach(order => {
      console.log(`  - ${order.orderNumber}: $${order.totalAmount / 100} (${order.status})`);
      console.log(`    Tips: ${order.tips.length}`);
    });

    // Check existing tips
    const tips = await prisma.tip.findMany({
      where: { celebrityId: emmaStone.id }
    });

    console.log(`\n💰 Tips found: ${tips.length}`);
    tips.forEach(tip => {
      console.log(`  - $${tip.amount / 100}: ${tip.message} (${tip.status})`);
    });

    // Check existing bookings
    const bookings = await prisma.booking.findMany({
      where: { celebrityId: emmaStone.id }
    });

    console.log(`\n📋 Bookings found: ${bookings.length}`);
    bookings.forEach(booking => {
      console.log(`  - ${booking.orderNumber}: $${booking.totalAmount / 100} (${booking.status})`);
    });

    // Calculate totals
    const totalEarnings = orders.reduce((sum, order) => sum + order.celebrityAmount, 0);
    const totalTips = tips.reduce((sum, tip) => sum + tip.amount, 0);
    const confirmedEarnings = orders
      .filter(order => order.status === 'CONFIRMED')
      .reduce((sum, order) => sum + order.celebrityAmount, 0);

    console.log('\n📊 Summary:');
    console.log(`- Total Earnings: $${totalEarnings / 100}`);
    console.log(`- Confirmed Earnings: $${confirmedEarnings / 100}`);
    console.log(`- Total Tips: $${totalTips / 100}`);
    console.log(`- Total Revenue: $${(totalEarnings + totalTips) / 100}`);

  } catch (error) {
    console.error('❌ Error checking current data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentData();
