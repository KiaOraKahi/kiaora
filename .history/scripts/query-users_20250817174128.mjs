import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const prisma = new PrismaClient();

async function queryUsers() {
  try {
    console.log('🔍 Connecting to database...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Query all users
    console.log('\n👥 Fetching all users...');
    const users = await prisma.user.findMany({
      include: {
        celebrityProfile: {
          select: {
            id: true,
            category: true,
            verified: true,
            isActive: true,
            totalEarnings: true,
            rating: true,
          }
        },
        accounts: {
          select: {
            provider: true,
            type: true,
          }
        },
        sessions: {
          select: {
            expires: true,
          }
        },
        bookings: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          }
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          }
        },
        tips: {
          select: {
            id: true,
            amount: true,
            createdAt: true,
          }
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            createdAt: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`\n📊 Found ${users.length} users:`);
    console.log('='.repeat(80));
    
    if (users.length === 0) {
      console.log('\n📭 No users found in the database.');
      console.log('This is expected for a fresh database installation.');
      console.log('\n💡 To add test users, you can:');
      console.log('1. Run the application and register users');
      console.log('2. Use Prisma Studio to add data manually');
      console.log('3. Create seed data scripts');
    } else {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. User ID: ${user.id}`);
        console.log(`   Name: ${user.name || 'N/A'}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Verified: ${user.isVerified ? '✅ Yes' : '❌ No'}`);
        console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
        console.log(`   Updated: ${user.updatedAt.toLocaleDateString()}`);
        
        // Celebrity profile info
        if (user.celebrityProfile) {
          const celeb = user.celebrityProfile;
          console.log(`   🎭 Celebrity Profile:`);
          console.log(`      Category: ${celeb.category || 'N/A'}`);
          console.log(`      Verified: ${celeb.verified ? '✅ Yes' : '❌ No'}`);
          console.log(`      Active: ${celeb.isActive ? '✅ Yes' : '❌ No'}`);
          console.log(`      Rating: ${celeb.rating || 'N/A'}`);
          console.log(`      Total Earnings: $${celeb.totalEarnings || 0}`);
        }
        
        // Account connections
        if (user.accounts.length > 0) {
          console.log(`   🔗 Connected Accounts:`);
          user.accounts.forEach(account => {
            console.log(`      ${account.provider} (${account.type})`);
          });
        }
        
        // Activity stats
        console.log(`   📈 Activity:`);
        console.log(`      Bookings: ${user.bookings.length}`);
        console.log(`      Orders: ${user.orders.length}`);
        console.log(`      Tips Given: ${user.tips.length}`);
        console.log(`      Reviews: ${user.reviews.length}`);
        
        // Recent activity
        if (user.orders.length > 0) {
          const recentOrder = user.orders[0];
          console.log(`   🛒 Recent Order: ${recentOrder.orderNumber} - $${recentOrder.totalAmount} (${recentOrder.status})`);
        }
        
        if (user.tips.length > 0) {
          const totalTips = user.tips.reduce((sum, tip) => sum + tip.amount, 0);
          console.log(`   💰 Total Tips Given: $${totalTips}`);
        }
        
        console.log('   ' + '-'.repeat(60));
      });
    }
    
    // Summary statistics
    console.log('\n📊 SUMMARY STATISTICS:');
    console.log('='.repeat(50));
    
    const totalUsers = users.length;
    const celebrities = users.filter(u => u.celebrityProfile);
    const fans = users.filter(u => !u.celebrityProfile);
    const verifiedUsers = users.filter(u => u.isVerified);
    const verifiedCelebrities = celebrities.filter(c => c.celebrityProfile.verified);
    
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Celebrities: ${celebrities.length}`);
    console.log(`Fans: ${fans.length}`);
    console.log(`Verified Users: ${verifiedUsers.length}`);
    console.log(`Verified Celebrities: ${verifiedCelebrities.length}`);
    
    // Role breakdown
    const roleCounts = {};
    users.forEach(user => {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });
    
    console.log('\nRole Breakdown:');
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`  ${role}: ${count}`);
    });
    
    // Celebrity categories
    if (celebrities.length > 0) {
      const categories = {};
      celebrities.forEach(celeb => {
        const category = celeb.celebrityProfile.category || 'Uncategorized';
        categories[category] = (categories[category] || 0) + 1;
      });
      
      console.log('\nCelebrity Categories:');
      Object.entries(categories).forEach(([category, count]) => {
        console.log(`  ${category}: ${count}`);
      });
    }
    
    // Recent activity
    const recentUsers = users.slice(0, 5);
    console.log('\n🆕 Recent Users (Last 5):');
    recentUsers.forEach(user => {
      console.log(`  ${user.name || 'N/A'} (${user.email}) - ${user.createdAt.toLocaleDateString()}`);
    });
    
  } catch (error) {
    console.error('❌ Error querying users:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database disconnected');
  }
}

// Run the query
queryUsers();
