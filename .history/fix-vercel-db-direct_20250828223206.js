import { PrismaClient } from '@prisma/client';

// Use the exact Vercel database URLs you provided
const vercelDatabaseUrl = "postgres://f6b3594d231a10194416a318a056ea2946f16e73c093bca313bf296cc00343bf:sk_qcpY8_xIfgKD2qhKfZBra@db.prisma.io:5432/postgres?sslmode=require";

console.log('🔍 Using Vercel database URL:', vercelDatabaseUrl.substring(0, 50) + '...');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: vercelDatabaseUrl
    }
  }
});

async function fixVercelDatabase() {
  try {
    console.log('🔍 Checking Vercel database schema...');
    
    // Check the current schema
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'celebrity_applications' 
      ORDER BY ordinal_position;
    `;
    
    const hasAchievements = columns.some(col => col.column_name === 'achievements');
    const hasProfession = columns.some(col => col.column_name === 'profession');
    
    console.log(`\n🔍 Current schema:`);
    console.log(`- achievements: ${hasAchievements ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`- profession: ${hasProfession ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`- Total columns: ${columns.length}`);
    
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
        const exists = columns.some(existing => existing.column_name === col.name);
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
    
    // Test the fix
    console.log('\n🧪 Testing celebrity application creation...');
    try {
      const testApp = await prisma.celebrityApplication.create({
        data: {
          fullName: "Test User",
          email: `test-${Date.now()}@example.com`,
          phone: "1234567890",
          dateOfBirth: "1990-01-01",
          nationality: "Test",
          profession: "Test",
          category: "Test",
          experience: "This is a test application with more than 50 characters to meet the minimum requirement.",
          achievements: "Test achievements",
          instagramHandle: null,
          twitterHandle: null,
          tiktokHandle: null,
          youtubeHandle: null,
          otherSocialMedia: null,
          followerCount: "0",
          basePrice: 299.0,
          rushPrice: 399.0,
          languages: ["English"],
          availability: "24 hours",
          specialRequests: null,
          motivation: "Test motivation",
          hasProfilePhoto: false,
          hasIdDocument: false,
          profilePhotoUrl: null,
          idDocumentUrl: null,
          status: "PENDING",
        },
      });
      
      console.log('✅ Test application created successfully!');
      
      // Delete the test application
      await prisma.celebrityApplication.delete({
        where: { id: testApp.id }
      });
      
      console.log('✅ Test application deleted successfully!');
      console.log('\n🎉 Vercel database is now ready for celebrity applications!');
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error fixing Vercel database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixVercelDatabase();
