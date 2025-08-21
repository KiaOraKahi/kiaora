import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function verifyAllDemoAccounts() {
  try {
    console.log('🔐 Verifying all demo accounts...');
    console.log('='.repeat(50));
    
    // Find all users with demo emails
    const demoUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'example.com' } },
          { email: { contains: 'test.com' } },
          { email: { contains: 'demo.com' } },
          { email: 'john.doe@example.com' },
          { email: 'jane.smith@example.com' },
          { email: 'mike.johnson@example.com' },
          { email: 'sarah.wilson@example.com' },
          { email: 'david.brown@example.com' },
          { email: 'emma.stone@example.com' },
          { email: 'sarah.johnson@example.com' },
        ]
      }
    });
    
    console.log(`Found ${demoUsers.length} demo accounts to verify:`);
    
    // Update all demo users to verified status
    const updatePromises = demoUsers.map(async (user) => {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          emailVerified: new Date(),
        }
      });
      
      console.log(`✅ Verified: ${updatedUser.name} (${updatedUser.email}) - ${updatedUser.role}`);
      return updatedUser;
    });
    
    await Promise.all(updatePromises);
    
    console.log('\n🎉 All demo accounts have been verified!');
    console.log('='.repeat(50));
    
    // Display verified accounts
    const verifiedUsers = await prisma.user.findMany({
      where: {
        isVerified: true,
        OR: [
          { email: { contains: 'example.com' } },
          { email: { contains: 'test.com' } },
          { email: { contains: 'demo.com' } },
        ]
      },
      orderBy: { role: 'asc' }
    });
    
    console.log('\n📋 Verified Demo Accounts:');
    console.log('='.repeat(50));
    
    const fans = verifiedUsers.filter(user => user.role === 'FAN');
    const celebrities = verifiedUsers.filter(user => user.role === 'CELEBRITY');
    
    if (fans.length > 0) {
      console.log('\n👥 FAN Accounts:');
      fans.forEach(user => {
        console.log(`   • ${user.name} (${user.email})`);
        console.log(`     Password: password123 (for most accounts)`);
        console.log(`     Password: user123 (for sarah.johnson@example.com)`);
      });
    }
    
    if (celebrities.length > 0) {
      console.log('\n🎭 CELEBRITY Accounts:');
      celebrities.forEach(user => {
        console.log(`   • ${user.name} (${user.email})`);
        console.log(`     Password: password123 (for most accounts)`);
        console.log(`     Password: celebrity123 (for emma.stone@example.com)`);
      });
    }
    
    console.log('\n💡 Login Credentials Summary:');
    console.log('='.repeat(50));
    console.log('Most demo accounts use password: password123');
    console.log('Special accounts:');
    console.log('  - sarah.johnson@example.com: user123');
    console.log('  - emma.stone@example.com: celebrity123');
    
  } catch (error) {
    console.error('❌ Error verifying demo accounts:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database disconnected');
  }
}

// Run the verification
verifyAllDemoAccounts();
