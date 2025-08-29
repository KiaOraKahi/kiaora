import { PrismaClient } from '@prisma/client';

// All possible database URLs from your Vercel environment
const databaseUrls = [
  {
    name: 'DATABASE_URL_POSTGRES_URL',
    url: "postgres://f6b3594d231a10194416a318a056ea2946f16e73c093bca313bf296cc00343bf:sk_qcpY8_xIfgKD2qhKfZBra@db.prisma.io:5432/postgres?sslmode=require"
  },
  {
    name: 'DATABASE_URL_PRISMA_DATABASE_URL (Accelerate)',
    url: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19xY3BZOF94SWZnS0QycWhLZlpCcmEiLCJhcGlfa2V5IjoiMDFLM1FYRTBDRDcySFQ0UEEwS1BaQjIyMlAiLCJ0ZW5hbnRfaWQiOiJmNmIzNTk0ZDIzMWExMDE5NDQxNmEzMThhMDU2ZWEyOTQ2ZjE2ZTczYzA5M2JjYTMxM2JmMjk2Y2MwMDM0M2JmIiwiaW50ZXJuYWxfc2VjcmV0IjoiYjAwNzMwMzktMGE1Ny00OTQ0LTg4YTAtN2Q5M2MwZWU1YmMwIn0._lZgz0FbY67gws_6WkXgTycRuHvXZmZXJ-BVBdYxa0U"
  },
  {
    name: 'DATABASE_URL_PRISMA_DATABASE_URL (Direct)',
    url: "postgres://f6b3594d231a10194416a318a056ea2946f16e73c093bca313bf296cc00343bf:sk_qcpY8_xIfgKD2qhKfZBra@db.prisma.io:5432/postgres?sslmode=require"
  }
];

async function identifyVercelDatabase() {
  console.log('🔍 Testing all database URLs to identify which one Vercel is using...\n');
  
  for (const dbInfo of databaseUrls) {
    console.log(`📡 Testing: ${dbInfo.name}`);
    console.log(`URL: ${dbInfo.url.substring(0, 50)}...`);
    
    try {
      const prisma = new PrismaClient({
        datasources: {
          db: { url: dbInfo.url }
        }
      });
      
      // Check the celebrity_applications table structure
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'celebrity_applications' 
        ORDER BY ordinal_position;
      `;
      
      const hasAchievements = columns.some(col => col.column_name === 'achievements');
      const hasProfession = columns.some(col => col.column_name === 'profession');
      
      console.log(`- achievements: ${hasAchievements ? '✅ EXISTS' : '❌ MISSING'}`);
      console.log(`- profession: ${hasProfession ? '✅ EXISTS' : '❌ MISSING'}`);
      console.log(`- Total columns: ${columns.length}`);
      
      // Check if this matches the Vercel production database (27 columns, missing achievements/profession)
      if (!hasAchievements && !hasProfession && columns.length === 27) {
        console.log('🎯 FOUND! This is the Vercel production database!');
        console.log('📍 This database needs to be updated with the missing columns.');
        
        await prisma.$disconnect();
        return dbInfo;
      } else if (hasAchievements && hasProfession && columns.length === 34) {
        console.log('✅ This database has all required columns (not the production database)');
      } else {
        console.log('❓ This database has a different schema');
      }
      
      await prisma.$disconnect();
      
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('❌ No database found that matches the Vercel production schema (27 columns, missing achievements/profession)');
  console.log('💡 This suggests Vercel might be using a different database URL or there might be a caching issue.');
  
  return null;
}

identifyVercelDatabase();
