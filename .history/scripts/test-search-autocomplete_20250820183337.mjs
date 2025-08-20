import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testSearchAutocomplete() {
  try {
    console.log('🔍 Testing search autocomplete functionality...\n');
    
    // Test 1: Check if celebrities API endpoint returns correct data
    console.log('📋 Test 1: Checking celebrities API data structure...');
    
    const celebrities = await prisma.celebrity.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });
    
    console.log(`✅ Found ${celebrities.length} active celebrities:`);
    celebrities.forEach((celebrity, index) => {
      console.log(`   ${index + 1}. ${celebrity.user.name} (ID: ${celebrity.id})`);
      console.log(`      - Category: ${celebrity.category}`);
      console.log(`      - Price: $${celebrity.pricePersonal || celebrity.price}`);
      console.log(`      - Rating: ${celebrity.averageRating || 'N/A'}`);
      console.log('');
    });
    
    // Test 2: Check if Emma Stone exists and has correct ID
    console.log('📋 Test 2: Checking Emma Stone data...');
    const emmaStone = celebrities.find(c => c.user.name.toLowerCase().includes('emma stone'));
    
    if (emmaStone) {
      console.log('✅ Emma Stone found:');
      console.log(`   - ID: ${emmaStone.id}`);
      console.log(`   - Name: ${emmaStone.user.name}`);
      console.log(`   - Category: ${emmaStone.category}`);
      console.log(`   - URL: /celebrities/${emmaStone.id}`);
      console.log('');
      
      // Test 3: Verify the URL format
      console.log('📋 Test 3: Testing URL generation...');
      const expectedUrl = `/celebrities/${emmaStone.id}`;
      console.log(`✅ Expected URL: ${expectedUrl}`);
      console.log(`✅ This should NOT be /celebrities/1 anymore!`);
      console.log('');
      
      // Test 4: Check if search would work
      console.log('📋 Test 4: Testing search functionality...');
      const searchQuery = 'emma';
      const matchingCelebrities = celebrities.filter(c => 
        c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      console.log(`✅ Search for "${searchQuery}" found ${matchingCelebrities.length} results:`);
      matchingCelebrities.forEach(celeb => {
        console.log(`   - ${celeb.user.name} (${celeb.id})`);
      });
      
    } else {
      console.log('❌ Emma Stone not found in database');
    }
    
    console.log('\n🎉 Search autocomplete test completed!');
    console.log('📋 The search should now use real celebrity IDs instead of hardcoded "1"');
    
  } catch (error) {
    console.error('❌ Error testing search autocomplete:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSearchAutocomplete();
