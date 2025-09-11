// Test script to verify Vercel Blob configuration
const { put } = require('@vercel/blob');

async function testBlobConfig() {
  try {
    console.log('🧪 Testing Vercel Blob Configuration...');
    
    // Set the environment variable
    process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_mwWrhk8wGc7jnjok_0cG9DwYA8sbroIcJgE4HRT99i4WSUf";
    
    console.log('✅ BLOB_READ_WRITE_TOKEN is set');
    console.log('📏 Token length:', process.env.BLOB_READ_WRITE_TOKEN.length);
    
    // Create a test file
    const testContent = 'This is a test file for Vercel Blob upload';
    const testFile = new File([testContent], 'test-upload.txt', { type: 'text/plain' });
    
    console.log('📁 Test file created:', testFile.name, 'Size:', testFile.size, 'bytes');
    
    // Test upload
    const filename = `test-uploads/test-${Date.now()}.txt`;
    console.log('🚀 Uploading to:', filename);
    
    const blob = await put(filename, testFile, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    
    console.log('✅ Upload successful!');
    console.log('🔗 URL:', blob.url);
    console.log('📂 Pathname:', blob.pathname);
    console.log('📏 Size:', blob.size);
    
    return {
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size
    };
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testBlobConfig()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 Vercel Blob is working correctly!');
      console.log('You can now test file uploads on the join-celebrity page.');
    } else {
      console.log('\n💥 Vercel Blob test failed:', result.error);
    }
  })
  .catch(error => {
    console.error('💥 Test script error:', error);
  });
