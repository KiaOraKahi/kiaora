import { createConnectAccount } from '../lib/stripe.js'

async function testStripeConnect() {
  try {
    console.log("🧪 Testing Stripe Connect Account Creation...")
    
    // Test 1: New Zealand account (should only request transfers capability)
    console.log("\n📍 Test 1: New Zealand Account")
    console.log("Expected: Only 'transfers' capability, recipient service agreement")
    
    try {
      const nzAccount = await createConnectAccount({
        email: "test.nz@example.com",
        name: "Test NZ Celebrity",
        country: "NZ",
        businessType: "individual"
      })
      
      console.log("✅ NZ Account created successfully!")
      console.log("   - Account ID:", nzAccount.accountId)
      console.log("   - Onboarding URL:", nzAccount.onboardingUrl)
    } catch (error) {
      console.log("❌ NZ Account creation failed:", error.message)
    }
    
    // Test 2: US account (should request both capabilities)
    console.log("\n📍 Test 2: US Account")
    console.log("Expected: Both 'card_payments' and 'transfers' capabilities")
    
    try {
      const usAccount = await createConnectAccount({
        email: "test.us@example.com",
        name: "Test US Celebrity",
        country: "US",
        businessType: "individual"
      })
      
      console.log("✅ US Account created successfully!")
      console.log("   - Account ID:", usAccount.accountId)
      console.log("   - Onboarding URL:", usAccount.onboardingUrl)
    } catch (error) {
      console.log("❌ US Account creation failed:", error.message)
    }
    
    console.log("\n🎉 Stripe Connect testing completed!")
    
  } catch (error) {
    console.error("❌ Test failed:", error)
  }
}

testStripeConnect()
