import fetch from 'node-fetch'

async function testCelebritiesAPI() {
  try {
    console.log('🧪 Testing celebrities API...')
    
    // Test 1: Get all celebrities
    console.log('\n1️⃣ Testing: Get all celebrities')
    const allResponse = await fetch('https://kirawebfivr-hjaz.vercel.app/api/celebrities')
    const allData = await allResponse.json()
    console.log('Status:', allResponse.status)
    console.log('Response:', JSON.stringify(allData, null, 2))
    
    // Test 2: Search for Sarah
    console.log('\n2️⃣ Testing: Search for "Sarah"')
    const searchResponse = await fetch('https://kirawebfivr-hjaz.vercel.app/api/celebrities?search=Sarah')
    const searchData = await searchResponse.json()
    console.log('Status:', searchResponse.status)
    console.log('Response:', JSON.stringify(searchData, null, 2))
    
    // Test 3: Get all category
    console.log('\n3️⃣ Testing: Category "All"')
    const categoryResponse = await fetch('https://kirawebfivr-hjaz.vercel.app/api/celebrities?category=All')
    const categoryData = await categoryResponse.json()
    console.log('Status:', categoryResponse.status)
    console.log('Response:', JSON.stringify(categoryData, null, 2))
    
  } catch (error) {
    console.error('❌ Error testing API:', error)
  }
}

testCelebritiesAPI()
