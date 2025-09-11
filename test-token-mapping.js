// Test to see which blob store the token points to
import { put } from '@vercel/blob';

const testTokenMapping = async () => {
  try {
    console.log('🔍 Testing blob token mapping...');
    
    // Set the token you provided
    process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_mwWrhk8wGc7jnjok_0cG9DwYA8sbroIcJgE4HRT99i4WSUf";
    
    console.log('📋 Token:', process.env.BLOB_READ_WRITE_TOKEN);
    
    // Create a test file
    const testContent = 'Test file for token mapping verification';
    const testFile = new File([testContent], 'token-test.txt', { type: 'text/plain' });
    
    // Try to upload with your token
    const filename = `token-test-${Date.now()}.txt`;
    console.log('📤 Uploading to filename:', filename);
    
    const blob = await put(filename, testFile, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    
    console.log('✅ Upload successful with your token!');
    console.log('🔗 Generated URL:', blob.url);
    console.log('📂 Pathname:', blob.pathname);
    
    // Extract the subdomain from the URL
    const url = new URL(blob.url);
    const subdomain = url.hostname.split('.')[0];
    console.log('🌐 Blob subdomain:', subdomain);
    
    return {
      success: true,
      url: blob.url,
      subdomain: subdomain,
      pathname: blob.pathname
    };
    
  } catch (error) {
    console.error('❌ Upload failed with your token:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Run the test
testTokenMapping()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 Your token is working!');
      console.log('📍 Blob store URL:', result.url);
      console.log('🏷️  Subdomain:', result.subdomain);
    } else {
      console.log('\n💥 Token test failed:', result.error);
    }
  })
  .catch(error => {
    console.error('💥 Test error:', error);
  });
