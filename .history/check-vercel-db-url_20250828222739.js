import { PrismaClient } from '@prisma/client';

console.log('🔍 Checking which database URL Vercel is using...');

// Check all possible database URL environment variables
const envVars = {
  'DATABASE_URL': process.env.DATABASE_URL,
  'DATABASE_URL_POSTGRES_URL': process.env.DATABASE_URL_POSTGRES_URL,
  'DATABASE_URL_PRISMA_DATABASE_URL': process.env.DATABASE_URL_PRISMA_DATABASE_URL,
  'DATABASE_URL_DATABASE_URL': process.env.DATABASE_URL_DATABASE_URL
};

console.log('\n📋 Environment variables found:');
Object.entries(envVars).forEach(([key, value]) => {
  if (value) {
    console.log(`✅ ${key}: ${value.substring(0, 50)}...`);
  } else {
    console.log(`❌ ${key}: NOT SET`);
  }
});

// Check which one Prisma is actually using
console.log('\n🔍 Checking which database Prisma is connecting to...');

const prisma = new PrismaClient();

async function checkDatabaseConnection() {
  try {
    // Get the current database URL from Prisma
    const databaseUrl = process.env.DATABASE_URL;
    console.log(`\n🎯 Prisma is using: ${databaseUrl ? databaseUrl.substring(0, 50) + '...' : 'NOT SET'}`);
    
    // Test the connection
    const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`;
    console.log('\n📊 Database connection info:');
    console.log('Database:', result[0].current_database);
    console.log('User:', result[0].current_user);
    console.log('Version:', result[0].version);
    
    // Check if this is the database we updated
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    console.log('\n📋 Tables in this database:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Check celebrity_applications table specifically
    const celebrityAppColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'celebrity_applications' 
      ORDER BY ordinal_position;
    `;
    
    const hasAchievements = celebrityAppColumns.some(col => col.column_name === 'achievements');
    const hasProfession = celebrityAppColumns.some(col => col.column_name === 'profession');
    
    console.log('\n🔍 Celebrity Applications table check:');
    console.log(`- achievements column: ${hasAchievements ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`- profession column: ${hasProfession ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`- Total columns: ${celebrityAppColumns.length}`);
    
    if (hasAchievements && hasProfession) {
      console.log('\n✅ This appears to be the updated database!');
    } else {
      console.log('\n❌ This database is missing the required columns!');
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseConnection();
