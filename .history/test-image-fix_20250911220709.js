// Test script to verify the image domain fix
import fetch from 'node-fetch';

async function testImageFix() {
  try {
    console.log('🔍 Testing celebrity images after domain fix...\n');
    
    // Test the celebrities API
    const response = await fetch('http://localhost:3001/api/celebrities?limit=3');
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
      return;
    }
    
    console.log(`✅ Found ${data.celebrities.length} celebrities\n`);
    
    // Check each celebrity's image URL
    data.celebrities.forEach((celebrity, index) => {
      console.log(`👤 Celebrity ${index + 1}: ${celebrity.name}`);
      console.log(`   Image URL: ${celebrity.image}`);
      
      // Check if the URL contains the correct domain
      if (celebrity.image && celebrity.image.includes('mwwrhk8wgc7jnjok.public.blob.vercel-storage.com')) {
        console.log(`   ✅ Correct Vercel Blob domain`);
      } else if (celebrity.image && celebrity.image.includes('blob.vercel-storage.com')) {
        console.log(`   ⚠️  Different Vercel Blob domain`);
      } else if (celebrity.image && celebrity.image.includes('placeholder')) {
        console.log(`   ℹ️  Using placeholder image`);
      } else {
        console.log(`   ❓ Unknown image source`);
      }
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testImageFix();
