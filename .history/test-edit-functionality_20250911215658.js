// Test script to verify edit functionality
const testEditFunctionality = async () => {
  console.log("🧪 Testing Edit Functionality...")
  
  try {
    // 1. Get current services
    console.log("1. Fetching current services...")
    const servicesResponse = await fetch('http://localhost:3000/api/admin/services')
    const servicesData = await servicesResponse.json()
    
    if (!servicesData.services || servicesData.services.length === 0) {
      console.log("❌ No services found to test with")
      return
    }
    
    const firstService = servicesData.services[0]
    console.log(`✅ Found service: "${firstService.title}"`)
    
    // 2. Test updating the service
    console.log("2. Testing service update...")
    const updateData = {
      ...firstService,
      title: firstService.title + " (TEST EDITED)",
      shortDescription: firstService.shortDescription + " - Updated via test",
      features: [...(firstService.features || []).map(f => f.text), "New test feature"]
    }
    
    const updateResponse = await fetch(`http://localhost:3000/api/admin/services/${firstService.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    })
    
    if (updateResponse.ok) {
      const updatedService = await updateResponse.json()
      console.log("✅ Service updated successfully!")
      console.log(`   New title: "${updatedService.title}"`)
      console.log(`   Features count: ${updatedService.features.length}`)
      
      // 3. Verify the update by fetching again
      console.log("3. Verifying update...")
      const verifyResponse = await fetch(`http://localhost:3000/api/admin/services/${firstService.id}`)
      const verifyData = await verifyResponse.json()
      
      if (verifyData.title === updateData.title) {
        console.log("✅ Update verified - changes are persistent!")
      } else {
        console.log("❌ Update verification failed")
      }
      
    } else {
      const error = await updateResponse.json()
      console.log("❌ Update failed:", error)
    }
    
  } catch (error) {
    console.log("❌ Test failed:", error.message)
  }
}

// Run the test
testEditFunctionality()
