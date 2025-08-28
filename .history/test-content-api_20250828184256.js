// Test script for Content Management API
const BASE_URL = 'http://localhost:3000';

async function testContentAPI() {
  console.log('Testing Content Management API...\n');

  try {
    // Test GET /api/admin/content
    console.log('1. Testing GET /api/admin/content...');
    const getResponse = await fetch(`${BASE_URL}/api/admin/content`);
    console.log('Status:', getResponse.status);
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('Response:', data);
    } else {
      const error = await getResponse.text();
      console.log('Error:', error);
    }
    console.log('');

    // Test POST /api/admin/content (will fail without auth, but should return 401)
    console.log('2. Testing POST /api/admin/content...');
    const postResponse = await fetch(`${BASE_URL}/api/admin/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: 'test.content.key',
        value: 'Test content value',
        type: 'TEXT',
        category: 'Test',
        description: 'Test description'
      })
    });
    console.log('Status:', postResponse.status);
    if (postResponse.ok) {
      const data = await postResponse.json();
      console.log('Response:', data);
    } else {
      const error = await postResponse.text();
      console.log('Error:', error);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testContentAPI();
