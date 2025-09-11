// Test upload with an image file
const testImageUpload = async () => {
  try {
    console.log('🧪 Testing image upload functionality...');
    
    // Create a simple test image (1x1 pixel PNG)
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 1, 1);
    
    canvas.toBlob(async (blob) => {
      const testFile = new File([blob], 'test-image.png', { type: 'image/png' });
      
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
    }, 'image/png');
    
  } catch (error) {
    console.error('💥 Test error:', error);
  }
};

// Run the test
testImageUpload();
