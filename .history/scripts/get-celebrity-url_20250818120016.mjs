import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function getCelebrityUrl() {
  try {
    console.log('🔍 Getting celebrity URLs...');
    
    const celebrities = await prisma.celebrity.findMany({
      where: {
        isActive: true,
      },
      include: {
        user: true,
      },
    });
    
    console.log(`\n📊 Found ${celebrities.length} active celebrities:`);
    
    if (celebrities.length === 0) {
      console.log('❌ No active celebrities found');
      return;
    }
    
    celebrities.forEach((celebrity, index) => {
      console.log(`${index + 1}. ${celebrity.user.name}`);
      console.log(`   - ID: ${celebrity.id}`);
      console.log(`   - URL: http://localhost:3000/celebrities/${celebrity.id}`);
      console.log(`   - Category: ${celebrity.category || 'N/A'}`);
      console.log(`   - Active: ${celebrity.isActive ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    // Show the first celebrity URL for easy testing
    const firstCelebrity = celebrities[0];
    console.log('🎯 Test this URL:');
    console.log(`http://localhost:3000/celebrities/${firstCelebrity.id}`);
    console.log(`\nThis should show ${firstCelebrity.user.name}'s profile page.`);
    
  } catch (error) {
    console.error('❌ Error getting celebrity URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getCelebrityUrl();
