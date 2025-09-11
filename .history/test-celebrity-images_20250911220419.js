// Test script to check celebrity image URLs
import fetch from 'node-fetch';

async function testCelebrityImages() {
  try {
    console.log('🔍 Testing celebrity images...\n');
    
    // Test the celebrities API
    const response = await fetch('http://localhost:3001/api/celebrities?limit=5');
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
      return;
    }
    
    console.log(`✅ Found ${data.celebrities.length} celebrities\n`);
    
    // Check each celebrity's image
    data.celebrities.forEach((celebrity, index) => {
      console.log(`👤 Celebrity ${index + 1}: ${celebrity.name}`);
      console.log(`   Image URL: ${celebrity.image}`);
      console.log(`   Category: ${celebrity.category}`);
      console.log(`   Verified: ${celebrity.verified}`);
      console.log(`   Featured: ${celebrity.featured}`);
      console.log('---');
    });
    
    // Test if images are accessible
    console.log('\n🌐 Testing image accessibility...\n');
    
    for (const celebrity of data.celebrities) {
      if (celebrity.image && !celebrity.image.includes('placeholder')) {
        try {
          const imageResponse = await fetch(celebrity.image);
          console.log(`✅ ${celebrity.name}: Image accessible (${imageResponse.status})`);
        } catch (error) {
          console.log(`❌ ${celebrity.name}: Image not accessible - ${error.message}`);
        }
      } else {
        console.log(`⚠️  ${celebrity.name}: Using placeholder image`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCelebrityImages();
