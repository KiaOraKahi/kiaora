// Test upload using an existing image file
const fs = require('fs');
const path = require('path');

const testExistingImageUpload = async () => {
  try {
    console.log('🧪 Testing upload with existing image...');
    
    // Read an existing image file from public folder
    const imagePath = path.join(__dirname, 'public', 'placeholder.svg');
    
    if (!fs.existsSync(imagePath)) {
      console.log('❌ No test image found at:', imagePath);
      return;
    }
    
    const imageBuffer = fs.readFileSync(imagePath);
    const testFile = new File([imageBuffer], 'test-image.svg', { type: 'image/svg+xml' });
    
    // Test the API upload endpoint
    const formData = new FormData();
    formData.append('file', testFile);
    formData.append('type', 'profile');
    
    console.log('📤 Uploading test image...');
    
    const response = await fetch('http://localhost:3001/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Upload successful!');
      console.log('📁 Result:', result);
      console.log('🔗 URL:', result.url);
      console.log('📂 Pathname:', result.pathname);
    } else {
      console.log('❌ Upload failed:', result);
    }
    
  } catch (error) {
    console.error('💥 Test error:', error);
  }
};

// Run the test
testExistingImageUpload();
