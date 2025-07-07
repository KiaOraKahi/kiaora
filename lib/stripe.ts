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

// ==========================================
// STRIPE CONNECT FUNCTIONS
// ==========================================

/**
 * Create a Stripe Connect Express account for a celebrity
 */
export const createConnectAccount = async (celebrityData: {
  email: string
  name: string
  country: string
  businessType?: "individual" | "company"
}): Promise<{ accountId: string; onboardingUrl: string }> => {
  try {
    console.log("🔄 Creating Stripe Connect account for:", celebrityData.email)

    // Create Express account
    const account = await stripe.accounts.create({
      type: "express",
      country: celebrityData.country,
      email: celebrityData.email,
      business_type: celebrityData.businessType || "individual",
      individual: {
        first_name: celebrityData.name.split(" ")[0],
        last_name: celebrityData.name.split(" ").slice(1).join(" ") || celebrityData.name.split(" ")[0],
        email: celebrityData.email,
      },
      capabilities: {
        transfers: { requested: true },
      },
      settings: {
        payouts: {
          schedule: {
            interval: "weekly",
            weekly_anchor: "friday",
          },
        },
      },
    })

    console.log("✅ Connect account created:", account.id)

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXTAUTH_URL}/celebrity-dashboard?setup=refresh`,
      return_url: `${process.env.NEXTAUTH_URL}/celebrity-dashboard?setup=complete`,
      type: "account_onboarding",
    })

    console.log("✅ Onboarding link created")

    return {
      accountId: account.id,
      onboardingUrl: accountLink.url,
    }
  } catch (error) {
    console.error("❌ Failed to create Connect account:", error)
    throw new Error(`Failed to create Connect account: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Get Connect account status and details
 */
export const getConnectAccountStatus = async (accountId: string) => {
  try {
    const account = await stripe.accounts.retrieve(accountId)

    return {
      id: account.id,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements,
      country: account.country,
      defaultCurrency: account.default_currency,
      email: account.email,
      payoutSchedule: account.settings?.payouts?.schedule,
    }
  } catch (error) {
    console.error("❌ Failed to get Connect account status:", error)
    throw new Error(`Failed to get account status: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Create a new onboarding link for existing account
 */
export const createOnboardingLink = async (accountId: string): Promise<string> => {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXTAUTH_URL}/celebrity-dashboard?setup=refresh`,
      return_url: `${process.env.NEXTAUTH_URL}/celebrity-dashboard?setup=complete`,
      type: "account_onboarding",
    })

    return accountLink.url
  } catch (error) {
    console.error("❌ Failed to create onboarding link:", error)
    throw new Error(`Failed to create onboarding link: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Create login link for Connect account dashboard
 */
export const createLoginLink = async (accountId: string): Promise<string> => {
  try {
    const loginLink = await stripe.accounts.createLoginLink(accountId)
    return loginLink.url
  } catch (error) {
    console.error("❌ Failed to create login link:", error)
    throw new Error(`Failed to create login link: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// ==========================================
// TRANSFER FUNCTIONS
// ==========================================

/**
 * Transfer booking payment to celebrity (80% split)
 */
export const transferBookingPayment = async (transferData: {
  accountId: string
  amount: number // Total booking amount
  currency: string
  orderId: string
  orderNumber: string
  celebrityName: string
  platformFeePercentage?: number
}): Promise<{ transferId: string; celebrityAmount: number; platformFee: number }> => {
  try {
    const platformFeePercentage = transferData.platformFeePercentage || 20 // Default 20%
    const platformFee = Math.round(transferData.amount * (platformFeePercentage / 100))
    const celebrityAmount = transferData.amount - platformFee

    console.log(`🔄 Transferring booking payment:`)
    console.log(`   Total: $${transferData.amount / 100}`)
    console.log(`   Platform Fee (${platformFeePercentage}%): $${platformFee / 100}`)
    console.log(`   Celebrity Amount (${100 - platformFeePercentage}%): $${celebrityAmount / 100}`)

    const transfer = await stripe.transfers.create({
      amount: celebrityAmount,
      currency: transferData.currency,
      destination: transferData.accountId,
      description: `Booking payment for order ${transferData.orderNumber} - ${transferData.celebrityName}`,
      metadata: {
        type: "booking_payment",
        orderId: transferData.orderId,
        orderNumber: transferData.orderNumber,
        celebrityName: transferData.celebrityName,
        originalAmount: transferData.amount.toString(),
        platformFee: platformFee.toString(),
        platformFeePercentage: platformFeePercentage.toString(),
      },
    })

    console.log("✅ Booking transfer successful:", transfer.id)

    return {
      transferId: transfer.id,
      celebrityAmount,
      platformFee,
    }
  } catch (error) {
    console.error("❌ Failed to transfer booking payment:", error)
    throw new Error(`Failed to transfer booking payment: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Transfer tip to celebrity (100% to celebrity)
 */
export const transferTipPayment = async (transferData: {
  accountId: string
  amount: number // Tip amount
  currency: string
  tipId: string
  orderId: string
  orderNumber: string
  celebrityName: string
  customerName: string
}): Promise<{ transferId: string }> => {
  try {
    console.log(`🔄 Transferring tip payment:`)
    console.log(`   Tip Amount: $${transferData.amount / 100}`)
    console.log(`   Celebrity gets: $${transferData.amount / 100} (100%)`)

    const transfer = await stripe.transfers.create({
      amount: transferData.amount, // 100% to celebrity
      currency: transferData.currency,
      destination: transferData.accountId,
      description: `Tip from ${transferData.customerName} for order ${transferData.orderNumber}`,
      metadata: {
        type: "tip_payment",
        tipId: transferData.tipId,
        orderId: transferData.orderId,
        orderNumber: transferData.orderNumber,
        celebrityName: transferData.celebrityName,
        customerName: transferData.customerName,
      },
    })

    console.log("✅ Tip transfer successful:", transfer.id)

    return {
      transferId: transfer.id,
    }
  } catch (error) {
    console.error("❌ Failed to transfer tip payment:", error)
    throw new Error(`Failed to transfer tip payment: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Get transfer details
 */
export const getTransferDetails = async (transferId: string) => {
  try {
    const transfer = await stripe.transfers.retrieve(transferId)
    return {
      id: transfer.id,
      amount: transfer.amount,
      currency: transfer.currency,
      created: transfer.created,
      description: transfer.description,
      destination: transfer.destination,
      metadata: transfer.metadata,
      status: transfer.reversed ? "reversed" : "completed",
    }
  } catch (error) {
    console.error("❌ Failed to get transfer details:", error)
    throw new Error(`Failed to get transfer details: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * List transfers for a Connect account
 */
export const listAccountTransfers = async (accountId: string, limit = 10) => {
  try {
    const transfers = await stripe.transfers.list({
      destination: accountId,
      limit,
    })

    return transfers.data.map((transfer) => ({
      id: transfer.id,
      amount: transfer.amount,
      currency: transfer.currency,
      created: transfer.created,
      description: transfer.description,
      metadata: transfer.metadata,
      status: transfer.reversed ? "reversed" : "completed",
    }))
  } catch (error) {
    console.error("❌ Failed to list account transfers:", error)
    throw new Error(`Failed to list transfers: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// ==========================================
// TIP PAYMENT FUNCTIONS
// ==========================================

/**
 * Create payment intent for tip
 */
export const createTipPaymentIntent = async (tipData: {
  amount: number
  currency: string
  customerId?: string
  orderId: string
  orderNumber: string
  celebrityId: string
  celebrityName: string
  customerName: string
}): Promise<{ clientSecret: string; paymentIntentId: string }> => {
  try {
    console.log("🔄 Creating tip payment intent:", {
      amount: tipData.amount,
      orderNumber: tipData.orderNumber,
      celebrity: tipData.celebrityName,
    })

    const paymentIntent = await stripe.paymentIntents.create({
      amount: tipData.amount,
      currency: tipData.currency,
      customer: tipData.customerId,
      description: `Tip for ${tipData.celebrityName} - Order ${tipData.orderNumber}`,
      metadata: {
        type: "tip",
        orderId: tipData.orderId,
        orderNumber: tipData.orderNumber,
        celebrityId: tipData.celebrityId,
        celebrityName: tipData.celebrityName,
        customerName: tipData.customerName,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    console.log("✅ Tip payment intent created:", paymentIntent.id)

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error) {
    console.error("❌ Failed to create tip payment intent:", error)
    throw new Error(`Failed to create tip payment intent: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// ==========================================
// WEBHOOK HELPERS
// ==========================================

/**
 * Verify webhook signature
 */
export const verifyWebhookSignature = (body: string, signature: string, secret: string): Stripe.Event => {
  try {
    return stripe.webhooks.constructEvent(body, signature, secret)
  } catch (error) {
    console.error("❌ Webhook signature verification failed:", error)
    throw new Error(
      `Webhook signature verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

/**
 * Handle Connect account updates
 */
export const handleConnectAccountUpdate = async (account: Stripe.Account) => {
  console.log("🔄 Processing Connect account update:", account.id)

  return {
    accountId: account.id,
    detailsSubmitted: account.details_submitted,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    requirements: account.requirements,
    country: account.country,
    defaultCurrency: account.default_currency,
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Calculate platform fee and celebrity amount
 */
export const calculatePaymentSplit = (
  totalAmount: number,
  platformFeePercentage = 20,
): { platformFee: number; celebrityAmount: number } => {
  const platformFee = Math.round(totalAmount * (platformFeePercentage / 100))
  const celebrityAmount = totalAmount - platformFee

  return {
    platformFee,
    celebrityAmount,
  }
}

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number, currency = "usd"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

/**
 * Get supported countries for Stripe Connect
 */
export const getSupportedCountries = (): string[] => {
  return [
    "AU",
    "AT",
    "BE",
    "BG",
    "CA",
    "HR",
    "CY",
    "CZ",
    "DK",
    "EE",
    "FI",
    "FR",
    "DE",
    "GI",
    "GR",
    "HK",
    "HU",
    "IE",
    "IT",
    "JP",
    "LV",
    "LI",
    "LT",
    "LU",
    "MT",
    "MX",
    "NL",
    "NZ",
    "NO",
    "PL",
    "PT",
    "RO",
    "SG",
    "SK",
    "SI",
    "ES",
    "SE",
    "CH",
    "GB",
    "US",
  ]
}

/**
 * Check if country supports Stripe Connect
 */
export const isCountrySupported = (countryCode: string): boolean => {
  return getSupportedCountries().includes(countryCode.toUpperCase())
}
