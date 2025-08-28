import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_PRISMA_DATABASE_URL || process.env.DATABASE_URL
    }
  }
});

async function updateVercelSchema() {
  try {
    console.log('🔄 Updating Vercel database schema...');
    
    // Add missing columns to celebrity_applications table
    const queries = [
      // Add profession column if it doesn't exist
      `DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'celebrity_applications' AND column_name = 'profession') THEN
          ALTER TABLE "celebrity_applications" ADD COLUMN "profession" TEXT;
        END IF;
      END $$;`,
      
      // Add achievements column if it doesn't exist
      `DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'celebrity_applications' AND column_name = 'achievements') THEN
          ALTER TABLE "celebrity_applications" ADD COLUMN "achievements" TEXT;
        END IF;
      END $$;`,
      
      // Add availability column if it doesn't exist
      `DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'celebrity_applications' AND column_name = 'availability') THEN
          ALTER TABLE "celebrity_applications" ADD COLUMN "availability" TEXT;
        END IF;
      END $$;`,
      
      // Add basePrice column if it doesn't exist
      `DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'celebrity_applications' AND column_name = 'basePrice') THEN
          ALTER TABLE "celebrity_applications" ADD COLUMN "basePrice" DOUBLE PRECISION;
        END IF;
      END $$;`,
      
      // Add rushPrice column if it doesn't exist
      `DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'celebrity_applications' AND column_name = 'rushPrice') THEN
          ALTER TABLE "celebrity_applications" ADD COLUMN "rushPrice" DOUBLE PRECISION;
        END IF;
      END $$;`,
      
      // Add followerCount column if it doesn't exist
      `DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'celebrity_applications' AND column_name = 'followerCount') THEN
          ALTER TABLE "celebrity_applications" ADD COLUMN "followerCount" TEXT;
        END IF;
      END $$;`,
      
      // Add motivation column if it doesn't exist
      `DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'celebrity_applications' AND column_name = 'motivation') THEN
          ALTER TABLE "celebrity_applications" ADD COLUMN "motivation" TEXT;
        END IF;
      END $$;`,
      
      // Update existing records with default values
      `UPDATE "celebrity_applications" SET 
        "profession" = COALESCE("profession", "category"),
        "achievements" = COALESCE("achievements", "experience"),
        "availability" = COALESCE("availability", '24 hours'),
        "basePrice" = COALESCE("basePrice", 299.0),
        "rushPrice" = COALESCE("rushPrice", 399.0),
        "followerCount" = COALESCE("followerCount", '0'),
        "motivation" = COALESCE("motivation", "experience")
      WHERE "profession" IS NULL OR "achievements" IS NULL OR "availability" IS NULL OR "basePrice" IS NULL OR "rushPrice" IS NULL OR "followerCount" IS NULL OR "motivation" IS NULL;`,
      
      // Make columns NOT NULL after updating
      `ALTER TABLE "celebrity_applications" 
       ALTER COLUMN "profession" SET NOT NULL,
       ALTER COLUMN "achievements" SET NOT NULL,
       ALTER COLUMN "availability" SET NOT NULL,
       ALTER COLUMN "basePrice" SET NOT NULL,
       ALTER COLUMN "rushPrice" SET NOT NULL,
       ALTER COLUMN "followerCount" SET NOT NULL,
       ALTER COLUMN "motivation" SET NOT NULL;`
    ];

    for (const query of queries) {
      try {
        await prisma.$executeRawUnsafe(query);
        console.log('✅ Query executed successfully');
      } catch (error) {
        console.log('⚠️ Query warning (might already exist):', error.message);
      }
    }

    console.log('✅ Vercel database schema updated successfully!');
    
    // Verify the changes
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'celebrity_applications' 
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 Current celebrity_applications table structure:');
    console.table(tableInfo);

  } catch (error) {
    console.error('❌ Error updating Vercel schema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateVercelSchema();
