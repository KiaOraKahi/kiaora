import { PrismaClient } from '@prisma/client';

// Try different database URLs that Vercel might be using
const possibleUrls = [
  process.env.DATABASE_URL,
  process.env.DATABASE_URL_POSTGRES_URL,
  process.env.DATABASE_URL_PRISMA_DATABASE_URL,
  process.env.DATABASE_URL_DATABASE_URL
].filter(Boolean);

console.log('🔍 Found database URLs:', possibleUrls.length);

async function testAndFixDatabase() {
  for (let i = 0; i < possibleUrls.length; i++) {
    const url = possibleUrls[i];
    console.log(`\n📡 Testing URL ${i + 1}: ${url.substring(0, 50)}...`);
    
    try {
      const prisma = new PrismaClient({
        datasources: {
          db: { url }
        }
      });
      
      // Test if this is the database Vercel is using (missing achievements column)
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
      
      // If this database is missing the columns, it's likely the one Vercel is using
      if (!hasAchievements && !hasProfession && columns.length === 27) {
        console.log('🎯 This appears to be the Vercel production database! Updating...');
        
        // Add the missing columns
        const queries = [
          `ALTER TABLE "celebrity_applications" ADD COLUMN "achievements" TEXT;`,
          `ALTER TABLE "celebrity_applications" ADD COLUMN "profession" TEXT;`,
          `ALTER TABLE "celebrity_applications" ADD COLUMN "availability" TEXT;`,
          `ALTER TABLE "celebrity_applications" ADD COLUMN "basePrice" DOUBLE PRECISION;`,
          `ALTER TABLE "celebrity_applications" ADD COLUMN "rushPrice" DOUBLE PRECISION;`,
          `ALTER TABLE "celebrity_applications" ADD COLUMN "followerCount" TEXT;`,
          `ALTER TABLE "celebrity_applications" ADD COLUMN "motivation" TEXT;`
        ];
        
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
        
        // Test the fix
        console.log('\n🧪 Testing the fix...');
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
          console.log('\n🎉 Vercel production database updated successfully!');
          
        } catch (error) {
          console.error('❌ Test failed:', error.message);
        }
        
        await prisma.$disconnect();
        return; // Exit after fixing the first matching database
        
      } else {
        console.log('⏭️ This database already has the required columns or is not the production database');
      }
      
      await prisma.$disconnect();
      
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`);
    }
  }
  
  console.log('\n❌ No matching database found to update');
}

testAndFixDatabase();
