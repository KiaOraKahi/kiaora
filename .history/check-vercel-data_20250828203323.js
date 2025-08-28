import { PrismaClient } from '@prisma/client';

// Use the correct Vercel database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://f6b3594d231a10194416a318a056ea2946f16e73c093bca313bf296cc00343bf:sk_qcpY8_xIfgKD2qhKfZBra@db.prisma.io:5432/postgres?sslmode=require"
    }
  }
});

async function checkVercelData() {
  try {
    console.log('🔍 Checking Vercel Database Content...\n');
    
    // Check Content table
    console.log('📝 CONTENT TABLE:');
    const contentItems = await prisma.content.findMany({
      orderBy: { category: 'asc' }
    });
    
    console.log(`Total content items: ${contentItems.length}`);
    contentItems.forEach(item => {
      console.log(`  • ${item.key} (${item.category})`);
    });
    
    console.log('\n🎯 SERVICES TABLE:');
    const services = await prisma.service.findMany({
      include: {
        features: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { title: 'asc' }
    });
    
    console.log(`Total services: ${services.length}`);
    services.forEach(service => {
      console.log(`  • ${service.title} - $${service.startingPrice} (${service.features.length} features)`);
    });
    
    console.log('\n📊 SUMMARY:');
    console.log(`✅ Content items: ${contentItems.length}`);
    console.log(`✅ Services: ${services.length}`);
    console.log(`✅ Total features: ${services.reduce((sum, service) => sum + service.features.length, 0)}`);
    
    console.log('\n🎉 Vercel database is populated with real data!');
    
  } catch (error) {
    console.error('❌ Error checking Vercel data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVercelData();
