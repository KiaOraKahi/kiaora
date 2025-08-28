import { PrismaClient } from '@prisma/client';

// Test with different database URLs
const urls = [
  process.env.DATABASE_URL,
  process.env.DATABASE_URL_PRISMA_DATABASE_URL,
  process.env.DATABASE_URL_POSTGRES_URL,
  process.env.DATABASE_URL_DATABASE_URL
].filter(Boolean);

console.log('🔍 Testing database connections...');
console.log('Available URLs:', urls.length);

for (let i = 0; i < urls.length; i++) {
  const url = urls[i];
  console.log(`\n📡 Testing URL ${i + 1}: ${url.substring(0, 50)}...`);
  
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: { url }
      }
    });
    
    // Test the connection and check the schema
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'celebrity_applications' 
      ORDER BY ordinal_position;
    `;
    
    const hasAchievements = columns.some(col => col.column_name === 'achievements');
    const hasProfession = columns.some(col => col.column_name === 'profession');
    
    console.log(`✅ Connection successful!`);
    console.log(`- achievements: ${hasAchievements ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`- profession: ${hasProfession ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`- Total columns: ${columns.length}`);
    
    await prisma.$disconnect();
    
    if (hasAchievements && hasProfession) {
      console.log(`🎯 This appears to be the correct database!`);
      break;
    }
    
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
  }
}

console.log('\n🔍 Database connection test completed.');
