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

async function checkVercelContent() {
  try {
    console.log('🔍 Checking Vercel Content table...');
    
    // Check Content table structure
    const contentColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Content' 
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 Content table structure:');
    console.table(contentColumns);
    
    // Check existing content
    const existingContent = await prisma.$queryRaw`
      SELECT "key", "value", "category", "status" 
      FROM "Content" 
      ORDER BY "key";
    `;
    
    console.log('\n📋 Existing content:');
    console.table(existingContent);
    
    // Add sample content if table is empty
    if (existingContent.length === 0) {
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
        },
        {
          key: 'homepage_cta_button',
          value: 'Get Started',
          type: 'TEXT',
          category: 'homepage',
          description: 'Call to action button text'
        },
        {
          key: 'homepage_search_placeholder',
          value: 'Search for your favorite celebrity...',
          type: 'TEXT',
          category: 'homepage',
          description: 'Search placeholder text'
        }
      ];
      
      for (const content of sampleContent) {
        try {
          await prisma.$executeRawUnsafe(`
            INSERT INTO "Content" ("id", "key", "value", "type", "category", "status", "description", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT ("key") DO UPDATE SET 
              "value" = EXCLUDED."value",
              "updatedAt" = CURRENT_TIMESTAMP;
          `, [
            `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            content.key,
            content.value,
            content.type,
            content.category,
            'active',
            content.description
          ]);
          console.log(`✅ Added/updated content: ${content.key}`);
        } catch (error) {
          console.log(`⚠️ Warning adding ${content.key}:`, error.message);
        }
      }
    } else {
      console.log('\n✅ Content table already has data!');
    }
    
    // Test the content API endpoint
    console.log('\n🧪 Testing content retrieval...');
    try {
      const testContent = await prisma.content.findMany({
        where: {
          key: {
            in: ['homepage_hero_title', 'homepage_hero_subtitle']
          }
        }
      });
      
      console.log('✅ Content retrieval test successful!');
      console.log('Retrieved content:', testContent.length, 'items');
      
    } catch (error) {
      console.error('❌ Content retrieval test failed:', error.message);
    }
    
    // Final content count
    const finalContent = await prisma.$queryRaw`
      SELECT COUNT(*) as total_content FROM "Content";
    `;
    
    console.log(`\n📊 Total content items: ${finalContent[0].total_content}`);
    
  } catch (error) {
    console.error('❌ Error checking Vercel Content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVercelContent();
