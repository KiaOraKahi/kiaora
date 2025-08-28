import { PrismaClient } from '@prisma/client';

// Use the Vercel environment variables - try the ones that exist
const databaseUrl = process.env.DATABASE_URL_POSTGRES_URL || process.env.DATABASE_URL_DATABASE_URL || process.env.DATABASE_URL;

console.log('🔍 Using database URL:', databaseUrl ? `${databaseUrl.substring(0, 50)}...` : 'NOT FOUND');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});

async function fixVercelDatabase() {
  try {
    console.log('🔍 Checking Vercel database schema...');
    
    // First, let's check what columns actually exist
    const existingColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'celebrity_applications' 
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 Current celebrity_applications table structure:');
    console.table(existingColumns);
    
    // Check if the problematic columns exist
    const hasAchievements = existingColumns.some(col => col.column_name === 'achievements');
    const hasProfession = existingColumns.some(col => col.column_name === 'profession');
    
    console.log(`\n🔍 Column check:`);
    console.log(`- achievements: ${hasAchievements ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`- profession: ${hasProfession ? '✅ EXISTS' : '❌ MISSING'}`);
    
    if (!hasAchievements || !hasProfession) {
      console.log('\n🔄 Adding missing columns...');
      
      const queries = [];
      
      if (!hasAchievements) {
        queries.push(`ALTER TABLE "celebrity_applications" ADD COLUMN "achievements" TEXT;`);
      }
      
      if (!hasProfession) {
        queries.push(`ALTER TABLE "celebrity_applications" ADD COLUMN "profession" TEXT;`);
      }
      
      // Add other potentially missing columns
      const missingColumns = [
        { name: 'availability', type: 'TEXT' },
        { name: 'basePrice', type: 'DOUBLE PRECISION' },
        { name: 'rushPrice', type: 'DOUBLE PRECISION' },
        { name: 'followerCount', type: 'TEXT' },
        { name: 'motivation', type: 'TEXT' }
      ];
      
      for (const col of missingColumns) {
        const exists = existingColumns.some(existing => existing.column_name === col.name);
        if (!exists) {
          queries.push(`ALTER TABLE "celebrity_applications" ADD COLUMN "${col.name}" ${col.type};`);
        }
      }
      
      // Execute the queries
      for (const query of queries) {
        try {
          await prisma.$executeRawUnsafe(query);
          console.log(`✅ Executed: ${query}`);
        } catch (error) {
          console.log(`⚠️ Warning: ${error.message}`);
        }
      }
      
      // Update existing records with default values
      const updateQuery = `
        UPDATE "celebrity_applications" SET 
          "achievements" = COALESCE("achievements", "experience"),
          "profession" = COALESCE("profession", "category"),
          "availability" = COALESCE("availability", '24 hours'),
          "basePrice" = COALESCE("basePrice", 299.0),
          "rushPrice" = COALESCE("rushPrice", 399.0),
          "followerCount" = COALESCE("followerCount", '0'),
          "motivation" = COALESCE("motivation", "experience")
        WHERE "achievements" IS NULL OR "profession" IS NULL OR "availability" IS NULL OR "basePrice" IS NULL OR "rushPrice" IS NULL OR "followerCount" IS NULL OR "motivation" IS NULL;
      `;
      
      try {
        await prisma.$executeRawUnsafe(updateQuery);
        console.log('✅ Updated existing records with default values');
      } catch (error) {
        console.log(`⚠️ Update warning: ${error.message}`);
      }
      
      // Make columns NOT NULL
      const notNullQueries = [
        `ALTER TABLE "celebrity_applications" ALTER COLUMN "achievements" SET NOT NULL;`,
        `ALTER TABLE "celebrity_applications" ALTER COLUMN "profession" SET NOT NULL;`,
        `ALTER TABLE "celebrity_applications" ALTER COLUMN "availability" SET NOT NULL;`,
        `ALTER TABLE "celebrity_applications" ALTER COLUMN "basePrice" SET NOT NULL;`,
        `ALTER TABLE "celebrity_applications" ALTER COLUMN "rushPrice" SET NOT NULL;`,
        `ALTER TABLE "celebrity_applications" ALTER COLUMN "followerCount" SET NOT NULL;`,
        `ALTER TABLE "celebrity_applications" ALTER COLUMN "motivation" SET NOT NULL;`
      ];
      
      for (const query of notNullQueries) {
        try {
          await prisma.$executeRawUnsafe(query);
          console.log(`✅ Made column NOT NULL: ${query}`);
        } catch (error) {
          console.log(`⚠️ NOT NULL warning: ${error.message}`);
        }
      }
      
      console.log('\n✅ Vercel database schema updated successfully!');
    } else {
      console.log('\n✅ All required columns already exist!');
    }
    
    // Final verification
    const finalColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'celebrity_applications' 
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Final celebrity_applications table structure:');
    console.table(finalColumns);
    
  } catch (error) {
    console.error('❌ Error fixing Vercel database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixVercelDatabase();
