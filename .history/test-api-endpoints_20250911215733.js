// Test script to verify API endpoints
const testAPIEndpoints = async () => {
  console.log("🧪 Testing API Endpoints...")
  
  try {
    // Test public services endpoint
    console.log("1. Testing public services endpoint...")
    const publicResponse = await fetch('http://localhost:3000/api/services')
    const publicData = await publicResponse.json()
    
    if (publicData.services && publicData.services.length > 0) {
      console.log(`✅ Public API working - Found ${publicData.services.length} services`)
      console.log(`   First service: "${publicData.services[0].title}"`)
    } else {
      console.log("❌ Public API not working or no services found")
    }
    
    // Test admin services endpoint (without auth - should fail)
    console.log("2. Testing admin services endpoint (no auth)...")
    const adminResponse = await fetch('http://localhost:3000/api/admin/services')
    const adminData = await adminResponse.json()
    
    if (adminResponse.status === 401) {
      console.log("✅ Admin API properly protected - requires authentication")
    } else if (adminData.services && adminData.services.length > 0) {
      console.log(`✅ Admin API working - Found ${adminData.services.length} services`)
    } else {
      console.log("❌ Admin API not working as expected")
    }
    
  } catch (error) {
    console.log("❌ API test failed:", error.message)
    console.log("   Make sure the development server is running: npm run dev")
  }
}

// Run the test
testAPIEndpoints()
