import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkContentDatabase() {
  try {
    console.log('🔍 Checking content database...');
    
    // Get all content
    const allContent = await prisma.content.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    
    console.log(`\n📊 Total content items: ${allContent.length}`);
    
    // Group by category
    const byCategory = {};
    allContent.forEach(item => {
      if (!byCategory[item.category]) {
        byCategory[item.category] = [];
      }
      byCategory[item.category].push(item);
    });
    
    console.log('\n📂 Content by Category:');
    Object.entries(byCategory).forEach(([category, items]) => {
      console.log(`   ${category}: ${items.length} items`);
    });
    
    // Show sample items
    console.log('\n📝 Sample Content Items:');
    allContent.slice(0, 10).forEach(item => {
      console.log(`   ${item.key}: "${item.value.substring(0, 50)}${item.value.length > 50 ? '...' : ''}" (${item.category})`);
    });
    
    // Check for test/sample data
    const testData = allContent.filter(item => 
      item.key.includes('test') || 
      item.key.includes('sample') || 
      item.key.includes('demo') ||
      item.description?.includes('test') ||
      item.description?.includes('sample') ||
      item.description?.includes('demo')
    );
    
    if (testData.length > 0) {
      console.log('\n⚠️  Potential Test Data Found:');
      testData.forEach(item => {
        console.log(`   ${item.key}: "${item.value}"`);
      });
    } else {
      console.log('\n✅ No obvious test data found');
    }
    
  } catch (error) {
    console.error('Error checking content database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkContentDatabase();
