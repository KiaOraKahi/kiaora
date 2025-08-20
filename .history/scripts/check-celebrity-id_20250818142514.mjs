import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function checkCelebrityId() {
  try {
    const celebrityId = 'cmefnczo500002udso3kjw6yl5';
    
    console.log('🔍 Checking celebrity ID:', celebrityId);
    
    const celebrity = await prisma.celebrity.findUnique({
      where: { id: celebrityId },
      include: { user: true }
    });
    
    if (celebrity) {
      console.log('✅ Celebrity found:');
      console.log('  - Name:', celebrity.user.name);
      console.log('  - Email:', celebrity.user.email);
      console.log('  - Active:', celebrity.isActive);
      console.log('  - Category:', celebrity.category);
    } else {
      console.log('❌ Celebrity not found in database');
      
      // List all celebrities to see what IDs exist
      console.log('\n📋 All celebrities in database:');
      const allCelebrities = await prisma.celebrity.findMany({
        include: { user: true },
        take: 5
      });
      
      allCelebrities.forEach(celeb => {
        console.log(`  - ID: ${celeb.id}`);
        console.log(`    Name: ${celeb.user.name}`);
        console.log(`    Active: ${celeb.isActive}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCelebrityId();
