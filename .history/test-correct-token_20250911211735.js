// Test upload with the correct blob token
const testWithCorrectToken = async () => {
  try {
    console.log('🧪 Testing upload with correct blob token...');
    
    // Set the correct environment variable
    process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_mwWrhk8wGc7jnjok_0cG9DwYA8sbroIcJgE4HRT99i4WSUf";
    
    console.log('✅ BLOB_READ_WRITE_TOKEN set to:', process.env.BLOB_READ_WRITE_TOKEN.substring(0, 20) + '...');
    
    // Create a simple test image (1x1 pixel PNG data URL)
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    // Convert data URL to blob
    const response = await fetch(testImageData);
    const blob = await response.blob();
    const testFile = new File([blob], 'test-image.png', { type: 'image/png' });
    
    console.log('📁 Test file created:', testFile.name, 'Size:', testFile.size, 'bytes');
    
    // Test the API upload endpoint
    const formData = new FormData();
    formData.append('file', testFile);
    formData.append('type', 'profile');
    
    console.log('📤 Uploading test image...');
    
    const uploadResponse = await fetch('http://localhost:3001/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    const result = await uploadResponse.json();
    
    if (uploadResponse.ok) {
      console.log('✅ Upload successful!');
      console.log('📁 Result:', result);
      console.log('🔗 URL:', result.url);
      console.log('📂 Pathname:', result.pathname);
      console.log('🎉 File upload is working correctly!');
    } else {
      console.log('❌ Upload failed:', result);
    }
    
  } catch (error) {
    console.error('💥 Test error:', error);
  }
};

// Run the test
testWithCorrectToken();
