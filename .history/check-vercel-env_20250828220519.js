import { PrismaClient } from '@prisma/client';

console.log('🔍 Checking Vercel environment variables...');

// Check all possible database URL environment variables
const envVars = {
  'DATABASE_URL': process.env.DATABASE_URL,
  'DATABASE_URL_POSTGRES_URL': process.env.DATABASE_URL_POSTGRES_URL,
  'DATABASE_URL_DATABASE_URL': process.env.DATABASE_URL_DATABASE_URL,
  'DATABASE_URL_PRISMA_DATABASE_URL': process.env.DATABASE_URL_PRISMA_DATABASE_URL
};

console.log('\n📋 Available environment variables:');
Object.entries(envVars).forEach(([key, value]) => {
  if (value) {
    console.log(`✅ ${key}: ${value.substring(0, 50)}...`);
  } else {
    console.log(`❌ ${key}: NOT SET`);
  }
});

// Determine which URL to use
const databaseUrl = process.env.DATABASE_URL_POSTGRES_URL || process.env.DATABASE_URL_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log('\n❌ No database URL found! Please check your Vercel environment variables.');
  process.exit(1);
}

console.log(`\n🎯 Using database URL: ${databaseUrl.substring(0, 50)}...`);

// Test the connection
async function testConnection() {
  const prisma = new PrismaClient({
    datasources: {
      db: { url: databaseUrl }
    }
  });

  try {
    console.log('\n🔍 Testing database connection...');
    
    // Check if the table exists
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'celebrity_applications';
    `;
    
    if (tables.length === 0) {
      console.log('❌ celebrity_applications table does not exist!');
      return;
    }
    
    console.log('✅ celebrity_applications table exists');
    
    // Check the table structure
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'celebrity_applications' 
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Table structure:');
    console.table(columns);
    
    const hasAchievements = columns.some(col => col.column_name === 'achievements');
    const hasProfession = columns.some(col => col.column_name === 'profession');
    
    console.log(`\n🔍 Critical columns:`);
    console.log(`- achievements: ${hasAchievements ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`- profession: ${hasProfession ? '✅ EXISTS' : '❌ MISSING'}`);
    
    if (!hasAchievements || !hasProfession) {
      console.log('\n⚠️ Missing required columns! Run fix-vercel-db.js to fix this.');
    } else {
      console.log('\n✅ All required columns exist!');
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
