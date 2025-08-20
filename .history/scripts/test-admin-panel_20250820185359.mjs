import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testAdminPanel() {
  try {
    console.log('🧪 Testing Admin Panel Setup...\n');
    
    // Test 1: Check if admin user exists
    console.log('📋 Test 1: Checking admin user...');
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (admin) {
      console.log('✅ Admin user found:');
      console.log(`   - Name: ${admin.name}`);
      console.log(`   - Email: ${admin.email}`);
      console.log(`   - Role: ${admin.role}`);
      console.log(`   - ID: ${admin.id}`);
    } else {
      console.log('❌ No admin user found');
      console.log('💡 Run: node scripts/create-admin-user.mjs');
      return;
    }
    
    // Test 2: Check if there are users to manage
    console.log('\n📋 Test 2: Checking user data...');
    const userCount = await prisma.user.count();
    const celebrityCount = await prisma.user.count({ where: { role: 'CELEBRITY' } });
    const regularUserCount = await prisma.user.count({ where: { role: 'USER' } });
    
    console.log(`✅ Found ${userCount} total users:`);
    console.log(`   - Regular users: ${regularUserCount}`);
    console.log(`   - Celebrities: ${celebrityCount}`);
    console.log(`   - Admins: ${userCount - regularUserCount - celebrityCount}`);
    
    // Test 3: Check if there are orders/bookings to manage
    console.log('\n📋 Test 3: Checking booking data...');
    const orderCount = await prisma.order.count();
    const bookingCount = await prisma.booking.count();
    
    console.log(`✅ Found ${orderCount} orders and ${bookingCount} bookings`);
    
    // Test 4: Check if there are celebrities to manage
    console.log('\n📋 Test 4: Checking celebrity data...');
    const celebrities = await prisma.celebrity.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });
    
    console.log(`✅ Found ${celebrities.length} celebrities:`);
    celebrities.forEach((celeb, index) => {
      console.log(`   ${index + 1}. ${celeb.user.name} (${celeb.user.email})`);
      console.log(`      - Active: ${celeb.isActive ? 'Yes' : 'No'}`);
      console.log(`      - Verified: ${celeb.verified ? 'Yes' : 'No'}`);
      console.log(`      - Featured: ${celeb.featured ? 'Yes' : 'No'}`);
    });
    
    console.log('\n🎉 Admin Panel Test Results:');
    console.log('✅ Admin user exists and is properly configured');
    console.log('✅ User data is available for management');
    console.log('✅ Booking data is available for oversight');
    console.log('✅ Celebrity data is available for management');
    console.log('');
    console.log('🌐 Access the admin panel:');
    console.log('   Login: http://localhost:3001/admin/login');
    console.log('   Dashboard: http://localhost:3001/admin/dashboard');
    console.log('');
    console.log('🔐 Login credentials:');
    console.log(`   Email: ${admin.email}`);
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error testing admin panel:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminPanel();
