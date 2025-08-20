import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function checkCelebrities() {
  try {
    console.log('🔍 Checking celebrities in database...');
    
    const celebrities = await prisma.celebrity.findMany({
      include: {
        user: true,
      },
    });
    
    console.log(`\n📊 Found ${celebrities.length} celebrities:`);
    
    if (celebrities.length === 0) {
      console.log('❌ No celebrities found in database');
      console.log('\n💡 You need to create some celebrities first:');
      console.log('1. Run: node scripts/create-celebrity-user.mjs');
      console.log('2. Or create a celebrity via the admin panel');
    } else {
      celebrities.forEach((celebrity, index) => {
        console.log(`${index + 1}. ${celebrity.user.name} (ID: ${celebrity.id})`);
        console.log(`   - Category: ${celebrity.category || 'N/A'}`);
        console.log(`   - Active: ${celebrity.isActive ? 'Yes' : 'No'}`);
        console.log(`   - Verified: ${celebrity.verified ? 'Yes' : 'No'}`);
        console.log(`   - Featured: ${celebrity.featured ? 'Yes' : 'No'}`);
        console.log('');
      });
    }
    
    // Also check users with CELEBRITY role
    const celebrityUsers = await prisma.user.findMany({
      where: {
        role: 'CELEBRITY',
      },
    });
    
    console.log(`👥 Users with CELEBRITY role: ${celebrityUsers.length}`);
    celebrityUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking celebrities:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCelebrities();
