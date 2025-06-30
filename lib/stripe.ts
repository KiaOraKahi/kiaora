import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
  typescript: true,
})

export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100) // Convert to cents
}

export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100 // Convert from cents
}

// Test Stripe connection
export const testStripeConnection = async (): Promise<boolean> => {
  try {
    await stripe.customers.list({ limit: 1 })
    console.log("✅ Stripe connection successful")
    return true
  } catch (error) {
    console.error("❌ Stripe connection failed:", error)
    return false
  }
}
