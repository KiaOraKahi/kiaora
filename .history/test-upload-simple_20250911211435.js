// Simple test to verify upload functionality
const testUpload = async () => {
  try {
    console.log('🧪 Testing file upload functionality...');
    
    // Create a simple test file
    const testContent = 'Test file content for upload verification';
    const testFile = new File([testContent], 'test-upload.txt', { type: 'text/plain' });
    
    // Test the API upload endpoint
    const formData = new FormData();
    formData.append('file', testFile);
    formData.append('type', 'profile');
    
    console.log('📤 Uploading test file...');
    
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
testUpload();
