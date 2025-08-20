const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findSpecificUsers() {
  try {
    console.log('🔍 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // 1. Find all celebrities
    console.log('\n🎭 FINDING ALL CELEBRITIES:');
    console.log('='.repeat(50));
    
    const celebrities = await prisma.user.findMany({
      where: {
        celebrityProfile: {
          isNot: null
        }
      },
      include: {
        celebrityProfile: {
          select: {
            id: true,
            category: true,
            verified: true,
            isActive: true,
            totalEarnings: true,
            rating: true,
            stripeConnectAccountId: true,
            stripePayoutsEnabled: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${celebrities.length} celebrities:`);
    celebrities.forEach((celeb, index) => {
      console.log(`\n${index + 1}. ${celeb.name || 'N/A'} (${celeb.email})`);
      console.log(`   Category: ${celeb.celebrityProfile.category || 'N/A'}`);
      console.log(`   Verified: ${celeb.celebrityProfile.verified ? '✅ Yes' : '❌ No'}`);
      console.log(`   Active: ${celeb.celebrityProfile.isActive ? '✅ Yes' : '❌ No'}`);
      console.log(`   Rating: ${celeb.celebrityProfile.rating || 'N/A'}`);
      console.log(`   Earnings: $${celeb.celebrityProfile.totalEarnings || 0}`);
      console.log(`   Stripe Connected: ${celeb.celebrityProfile.stripeConnectAccountId ? '✅ Yes' : '❌ No'}`);
      console.log(`   Payouts Enabled: ${celeb.celebrityProfile.stripePayoutsEnabled ? '✅ Yes' : '❌ No'}`);
    });
    
    // 2. Find verified celebrities
    console.log('\n✅ FINDING VERIFIED CELEBRITIES:');
    console.log('='.repeat(50));
    
    const verifiedCelebrities = await prisma.user.findMany({
      where: {
        celebrityProfile: {
          verified: true
        }
      },
      include: {
        celebrityProfile: {
          select: {
            category: true,
            totalEarnings: true,
            rating: true,
          }
        }
      }
    });
    
    console.log(`Found ${verifiedCelebrities.length} verified celebrities:`);
    verifiedCelebrities.forEach(celeb => {
      console.log(`  - ${celeb.name || 'N/A'} (${celeb.celebrityProfile.category}) - Rating: ${celeb.celebrityProfile.rating}`);
    });
    
    // 3. Find users with recent activity
    console.log('\n📅 FINDING USERS WITH RECENT ACTIVITY:');
    console.log('='.repeat(50));
    
    const recentUsers = await prisma.user.findMany({
      where: {
        OR: [
          { orders: { some: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } } },
          { tips: { some: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } } },
          { bookings: { some: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } } }
        ]
      },
      include: {
        orders: {
          where: {
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          },
          select: {
            orderNumber: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          }
        },
        tips: {
          where: {
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          },
          select: {
            amount: true,
            createdAt: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    console.log(`Found ${recentUsers.length} users with recent activity (last 30 days):`);
    recentUsers.forEach(user => {
      const totalSpent = user.orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const totalTips = user.tips.reduce((sum, tip) => sum + tip.amount, 0);
      console.log(`  - ${user.name || 'N/A'} (${user.email}): Orders: $${totalSpent}, Tips: $${totalTips}`);
    });
    
    // 4. Find high-value customers
    console.log('\n💰 FINDING HIGH-VALUE CUSTOMERS:');
    console.log('='.repeat(50));
    
    const highValueUsers = await prisma.user.findMany({
      include: {
        orders: {
          select: {
            totalAmount: true,
            status: true,
          }
        },
        tips: {
          select: {
            amount: true,
          }
        }
      }
    });
    
    // Calculate total spending for each user
    const usersWithSpending = highValueUsers.map(user => {
      const orderTotal = user.orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const tipTotal = user.tips.reduce((sum, tip) => sum + tip.amount, 0);
      return {
        ...user,
        totalSpent: orderTotal + tipTotal
      };
    });
    
    // Sort by total spending and get top 10
    const topSpenders = usersWithSpending
      .filter(user => user.totalSpent > 0)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
    
    console.log('Top 10 customers by spending:');
    topSpenders.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name || 'N/A'} (${user.email}): $${user.totalSpent}`);
    });
    
    // 5. Find inactive users
    console.log('\n😴 FINDING INACTIVE USERS:');
    console.log('='.repeat(50));
    
    const inactiveUsers = await prisma.user.findMany({
      where: {
        AND: [
          { orders: { none: {} } },
          { tips: { none: {} } },
          { bookings: { none: {} } },
          { updatedAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    
    console.log(`Found ${inactiveUsers.length} inactive users (no activity in 90+ days):`);
    inactiveUsers.forEach(user => {
      console.log(`  - ${user.name || 'N/A'} (${user.email}) - Last active: ${user.updatedAt.toLocaleDateString()}`);
    });
    
    // 6. Find users by role
    console.log('\n👥 FINDING USERS BY ROLE:');
    console.log('='.repeat(50));
    
    const roleCounts = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    });
    
    roleCounts.forEach(roleGroup => {
      console.log(`  ${roleGroup.role}: ${roleGroup._count.id} users`);
    });
    
  } catch (error) {
    console.error('❌ Error finding specific users:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database disconnected');
  }
}

// Run the specific user queries
findSpecificUsers();
