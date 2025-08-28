import { PrismaClient } from '@prisma/client';

// Use the exact Vercel database URL you provided
const vercelDatabaseUrl = "postgres://f6b3594d231a10194416a318a056ea2946f16e73c093bca313bf296cc00343bf:sk_qcpY8_xIfgKD2qhKfZBra@db.prisma.io:5432/postgres?sslmode=require";

console.log('🔍 Using Vercel database URL:', vercelDatabaseUrl.substring(0, 50) + '...');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: vercelDatabaseUrl
    }
  }
});

async function fixVercelContentTable() {
  try {
    console.log('🔍 Checking Vercel database for missing tables...');
    
    // Check what tables exist
    const existingTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    console.log('📋 Existing tables:');
    console.table(existingTables);
    
    // Check if Content table exists
    const hasContentTable = existingTables.some(table => table.table_name === 'Content');
    console.log(`\n🔍 Content table: ${hasContentTable ? '✅ EXISTS' : '❌ MISSING'}`);
    
    if (!hasContentTable) {
      console.log('\n🔄 Creating Content table...');
      
      // Create the ContentType enum if it doesn't exist
      try {
        await prisma.$executeRawUnsafe(`
          DO $$ BEGIN
            CREATE TYPE "ContentType" AS ENUM ('TEXT', 'HTML', 'JSON', 'IMAGE', 'NUMBER', 'BOOLEAN');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
        `);
        console.log('✅ ContentType enum created/verified');
      } catch (error) {
        console.log('⚠️ ContentType enum warning:', error.message);
      }
      
      // Create the Content table
      const createContentTable = `
        CREATE TABLE "Content" (
          "id" TEXT NOT NULL,
          "key" TEXT NOT NULL,
          "value" TEXT NOT NULL,
          "type" "ContentType" NOT NULL DEFAULT 'TEXT',
          "category" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'active',
          "description" TEXT,
          "updatedBy" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
        );
      `;
      
      try {
        await prisma.$executeRawUnsafe(createContentTable);
        console.log('✅ Content table created successfully');
      } catch (error) {
        console.log('❌ Error creating Content table:', error.message);
      }
      
      // Create unique index on key
      try {
        await prisma.$executeRawUnsafe(`
          CREATE UNIQUE INDEX "Content_key_key" ON "Content"("key");
        `);
        console.log('✅ Content key unique index created');
      } catch (error) {
        console.log('⚠️ Content key index warning:', error.message);
      }
      
      // Add some sample content
      console.log('\n📝 Adding sample content...');
      const sampleContent = [
        {
          key: 'homepage_hero_title',
          value: 'Get Personalized Video Messages from Your Favorite Celebrities',
          type: 'TEXT',
          category: 'homepage',
          description: 'Main hero title on homepage'
        },
        {
          key: 'homepage_hero_subtitle',
          value: 'Connect with celebrities for unique, personalized video messages that make your special moments unforgettable.',
          type: 'TEXT',
          category: 'homepage',
          description: 'Hero subtitle on homepage'
        },
        {
          key: 'homepage_featured_title',
          value: 'Featured Celebrities',
          type: 'TEXT',
          category: 'homepage',
          description: 'Featured celebrities section title'
        },
        {
          key: 'homepage_how_it_works_title',
          value: 'How It Works',
          type: 'TEXT',
          category: 'homepage',
          description: 'How it works section title'
        },
        {
          key: 'footer_about_text',
          value: 'Kia Ora connects fans with celebrities for personalized video messages that make every moment special.',
          type: 'TEXT',
          category: 'footer',
          description: 'About text in footer'
        }
      ];
      
      for (const content of sampleContent) {
        try {
          await prisma.$executeRawUnsafe(`
            INSERT INTO "Content" ("id", "key", "value", "type", "category", "status", "description", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT ("key") DO NOTHING;
          `, [
            `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            content.key,
            content.value,
            content.type,
            content.category,
            'active',
            content.description
          ]);
          console.log(`✅ Added sample content: ${content.key}`);
        } catch (error) {
          console.log(`⚠️ Warning adding ${content.key}:`, error.message);
        }
      }
      
    } else {
      console.log('\n✅ Content table already exists!');
    }
    
    // Check for other potentially missing tables
    const requiredTables = [
      'Service',
      'PlatformFeeTransfer',
      'SupportTicket',
      'SupportTicketResponse'
    ];
    
    console.log('\n🔍 Checking other potentially missing tables...');
    for (const tableName of requiredTables) {
      const exists = existingTables.some(table => table.table_name === tableName);
      console.log(`- ${tableName}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    }
    
    // Final verification
    const finalTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    console.log('\n📋 Final table list:');
    console.table(finalTables);
    
    // Test Content table operations
    console.log('\n🧪 Testing Content table operations...');
    try {
      const testContent = await prisma.content.create({
        data: {
          key: `test-${Date.now()}`,
          value: 'Test content value',
          type: 'TEXT',
          category: 'test',
          description: 'Test content for verification'
        }
      });
      
      console.log('✅ Test content created successfully!');
      
      // Delete the test content
      await prisma.content.delete({
        where: { id: testContent.id }
      });
      
      console.log('✅ Test content deleted successfully!');
      
    } catch (error) {
      console.error('❌ Content table test failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error fixing Vercel Content table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixVercelContentTable();
