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

async function addMissingContent() {
  try {
    console.log('🔍 Adding missing content keys...');
    
    // Content keys that the application expects (from fallbackContent)
    const requiredContent = [
      {
        key: 'homepage.hero.title',
        value: 'Kia Ora',
        type: 'TEXT',
        category: 'homepage',
        description: 'Main hero title on homepage'
      },
      {
        key: 'homepage.hero.subtitle',
        value: 'Connect with your favorite celebrities',
        type: 'TEXT',
        category: 'homepage',
        description: 'Hero subtitle on homepage'
      },
      {
        key: 'homepage.hero.description',
        value: 'Get personalized video messages from the stars you love',
        type: 'TEXT',
        category: 'homepage',
        description: 'Hero description on homepage'
      },
      {
        key: 'homepage.cta.primary',
        value: 'Browse Celebrities',
        type: 'TEXT',
        category: 'homepage',
        description: 'Primary call to action button'
      },
      {
        key: 'homepage.cta.secondary',
        value: 'Learn More',
        type: 'TEXT',
        category: 'homepage',
        description: 'Secondary call to action button'
      },
      {
        key: 'homepage.how-it-works.title',
        value: 'How It Works',
        type: 'TEXT',
        category: 'homepage',
        description: 'How it works section title'
      },
      {
        key: 'homepage.how-it-works.step1.title',
        value: 'Browse & Discover',
        type: 'TEXT',
        category: 'homepage',
        description: 'Step 1 title'
      },
      {
        key: 'homepage.how-it-works.step1.description',
        value: 'Explore our verified celebrities across entertainment, sports, and more',
        type: 'TEXT',
        category: 'homepage',
        description: 'Step 1 description'
      },
      {
        key: 'homepage.how-it-works.step2.title',
        value: 'Personalise Your Request',
        type: 'TEXT',
        category: 'homepage',
        description: 'Step 2 title'
      },
      {
        key: 'homepage.how-it-works.step2.description',
        value: 'Tell us exactly what you want and who it\'s for',
        type: 'TEXT',
        category: 'homepage',
        description: 'Step 2 description'
      },
      {
        key: 'homepage.how-it-works.step3.title',
        value: 'Secure Payment',
        type: 'TEXT',
        category: 'homepage',
        description: 'Step 3 title'
      },
      {
        key: 'homepage.how-it-works.step3.description',
        value: 'Complete your booking with our secure payment system',
        type: 'TEXT',
        category: 'homepage',
        description: 'Step 3 description'
      },
      {
        key: 'homepage.how-it-works.step4.title',
        value: 'Receive Your Video',
        type: 'TEXT',
        category: 'homepage',
        description: 'Step 4 title'
      },
      {
        key: 'homepage.how-it-works.step4.description',
        value: 'Get your personalised video within the promised timeframe',
        type: 'TEXT',
        category: 'homepage',
        description: 'Step 4 description'
      },
      {
        key: 'homepage.featured.title',
        value: 'Featured Celebrities',
        type: 'TEXT',
        category: 'homepage',
        description: 'Featured celebrities section title'
      },
      {
        key: 'homepage.featured.subtitle',
        value: 'Discover amazing talent ready to create your perfect message',
        type: 'TEXT',
        category: 'homepage',
        description: 'Featured celebrities section subtitle'
      },
      {
        key: 'homepage.services.title',
        value: 'Our Services',
        type: 'TEXT',
        category: 'homepage',
        description: 'Services section title'
      },
      {
        key: 'homepage.services.subtitle',
        value: 'Find the perfect celebrity for any occasion',
        type: 'TEXT',
        category: 'homepage',
        description: 'Services section subtitle'
      },
      {
        key: 'footer.copyright',
        value: '© 2025 Kia Ora. All rights reserved.',
        type: 'TEXT',
        category: 'footer',
        description: 'Footer copyright text'
      },
      {
        key: 'footer.description',
        value: 'Connect with celebrities for personalized video messages',
        type: 'TEXT',
        category: 'footer',
        description: 'Footer description'
      },
      {
        key: 'nav.home',
        value: 'Home',
        type: 'TEXT',
        category: 'navigation',
        description: 'Navigation home link'
      },
      {
        key: 'nav.about',
        value: 'About',
        type: 'TEXT',
        category: 'navigation',
        description: 'Navigation about link'
      },
      {
        key: 'nav.celebrities',
        value: 'Celebrities',
        type: 'TEXT',
        category: 'navigation',
        description: 'Navigation celebrities link'
      },
      {
        key: 'nav.how-it-works',
        value: 'How It Works',
        type: 'TEXT',
        category: 'navigation',
        description: 'Navigation how it works link'
      },
      {
        key: 'nav.pricing',
        value: 'Pricing',
        type: 'TEXT',
        category: 'navigation',
        description: 'Navigation pricing link'
      },
      {
        key: 'nav.contact',
        value: 'Contact',
        type: 'TEXT',
        category: 'navigation',
        description: 'Navigation contact link'
      },
      {
        key: 'ui.buttons.submit',
        value: 'Submit',
        type: 'TEXT',
        category: 'ui',
        description: 'Submit button text'
      },
      {
        key: 'ui.buttons.cancel',
        value: 'Cancel',
        type: 'TEXT',
        category: 'ui',
        description: 'Cancel button text'
      },
      {
        key: 'ui.buttons.browse',
        value: 'Browse',
        type: 'TEXT',
        category: 'ui',
        description: 'Browse button text'
      },
      {
        key: 'ui.buttons.learn-more',
        value: 'Learn More',
        type: 'TEXT',
        category: 'ui',
        description: 'Learn more button text'
      }
    ];
    
    console.log(`📝 Adding ${requiredContent.length} content items...`);
    
    for (const content of requiredContent) {
      try {
        const id = `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await prisma.$executeRawUnsafe(`
          INSERT INTO "Content" ("id", "key", "value", "type", "category", "status", "description", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT ("key") DO UPDATE SET 
            "value" = EXCLUDED."value",
            "type" = EXCLUDED."type",
            "category" = EXCLUDED."category",
            "status" = EXCLUDED."status",
            "description" = EXCLUDED."description",
            "updatedAt" = CURRENT_TIMESTAMP;
        `, id, content.key, content.value, content.type, content.category, 'active', content.description);
        
        console.log(`✅ Added/updated: ${content.key}`);
      } catch (error) {
        console.log(`⚠️ Warning adding ${content.key}:`, error.message);
      }
    }
    
    // Test content retrieval
    console.log('\n🧪 Testing content retrieval...');
    try {
      const testKeys = ['homepage.hero.title', 'homepage.hero.subtitle', 'footer.copyright'];
      const testContent = await prisma.content.findMany({
        where: {
          key: { in: testKeys },
          status: "active"
        }
      });
      
      console.log('✅ Content retrieval test successful!');
      console.log('Retrieved content:', testContent.length, 'items');
      testContent.forEach(item => {
        console.log(`  - ${item.key}: ${item.value}`);
      });
      
    } catch (error) {
      console.error('❌ Content retrieval test failed:', error.message);
    }
    
    // Final content count
    const finalContent = await prisma.$queryRaw`
      SELECT COUNT(*) as total_content FROM "Content";
    `;
    
    console.log(`\n📊 Total content items: ${finalContent[0].total_content}`);
    
  } catch (error) {
    console.error('❌ Error adding missing content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingContent();
