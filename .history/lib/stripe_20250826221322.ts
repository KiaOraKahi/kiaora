import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
})

interface CreateConnectAccountData {
  email: string
  name: string
  businessType?: "individual" | "company"
}

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
  refreshUrl?: string
  returnUrl?: string
}): Promise<{ accountId: string; onboardingUrl: string }> => {
  try {
    console.log("🔄 Creating Stripe Connect account for:", celebrityData.email)
    console.log("📍 Country:", celebrityData.country)

    // Safely split the name
    const nameParts = (celebrityData.name || "Celebrity User").trim().split(" ")
    const firstName = nameParts[0] || "Celebrity"
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "User"

    // 🔥 FIX: Check if this is a New Zealand account
    const isNewZealand = celebrityData.country.toLowerCase() === 'nz'
    
    console.log("🏛️ Service Agreement:", isNewZealand ? "recipient (for NZ)" : "full (default)")

    // Build account creation parameters
    const accountParams: Stripe.AccountCreateParams = {
      type: "express",
      country: celebrityData.country,
      email: celebrityData.email,
      business_type: celebrityData.businessType || "individual",
      individual: {
        first_name: firstName,
        last_name: lastName,
        email: celebrityData.email,
      },
      capabilities: isNewZealand ? {
        // For NZ accounts with recipient service agreement, only transfers is allowed
        transfers: { requested: true },
      } : {
        // For other countries, both capabilities are allowed
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        product_description: "Celebrity video messages and personalized content",
        mcc: "7922", // Theatrical producers and miscellaneous entertainment services
      },
      settings: {
        payouts: {
          schedule: {
            interval: "weekly",
            weekly_anchor: "friday",
          },
        },
      },
    }

    // 🔥 KEY FIX: Add recipient service agreement for NZ accounts
    if (isNewZealand) {
      accountParams.tos_acceptance = {
        service_agreement: "recipient"
      }
      console.log("✅ Applied 'recipient' service agreement for New Zealand account")
      console.log("✅ Using 'transfers' capability only for NZ account")
    } else {
      console.log("✅ Using 'card_payments' and 'transfers' capabilities for non-NZ account")
    }

    // Create Express account
    const account = await stripe.accounts.create(accountParams)

    console.log("✅ Connect account created:", account.id)
    console.log("📋 Service agreement:", isNewZealand ? "recipient" : "full (default)")

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: celebrityData.refreshUrl || `${process.env.NEXTAUTH_URL}/celebrity-dashboard?setup=refresh&tab=payments`,
      return_url: celebrityData.returnUrl || `${process.env.NEXTAUTH_URL}/celebrity-dashboard?setup=complete&tab=payments`,
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

export const updateExistingNZAccount = async (accountId: string) => {
  try {
    console.log("🔄 Updating existing NZ account to recipient agreement:", accountId)
    
    const updatedAccount = await stripe.accounts.update(accountId, {
      tos_acceptance: {
        service_agreement: "recipient"
      }
    })
    
    console.log("✅ Successfully updated to recipient service agreement")
    return updatedAccount
  } catch (error) {
    console.error("❌ Failed to update existing account:", error)
    throw error
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
export const createAccountLink = async (accountId: string, refreshUrl: string, returnUrl: string) => {
  try {
    console.log("🔄 Creating account link for:", accountId)

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    })

    console.log("✅ Account link created:", accountLink.url)
    return accountLink
  } catch (error) {
    console.error("❌ Failed to create account link:", error)
    throw new Error(`Failed to create account link: ${error instanceof Error ? error.message : "Unknown error"}`)
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
 * Transfer booking payment to celebrity (80% split) - ONLY AFTER APPROVAL
 */
export const transferBookingPayment = async (transferData: {
  accountId: string
  amount: number // Total booking amount in cents
  currency: string
  orderId: string
  orderNumber: string
  celebrityName: string
  platformFeePercentage?: number
}): Promise<{ transferId: string; celebrityAmount: number; platformFee: number }> => {
  try {
    const platformFeePercentage = transferData.platformFeePercentage || 20 // Default 20%
    const { platformFee, celebrityAmount } = calculatePaymentSplit(transferData.amount, platformFeePercentage)

    console.log(`🔄 Transferring booking payment AFTER APPROVAL:`)
    console.log(`   Total: $${transferData.amount / 100}`)
    console.log(`   Platform Fee (${platformFeePercentage}%): $${platformFee / 100}`)
    console.log(`   Celebrity Amount (${100 - platformFeePercentage}%): $${celebrityAmount / 100}`)

    const transfer = await stripe.transfers.create({
      amount: celebrityAmount,
      currency: transferData.currency,
      destination: transferData.accountId,
      description: `Approved video payment for order ${transferData.orderNumber} - ${transferData.celebrityName}`,
      metadata: {
        type: "approved_booking_payment",
        orderId: transferData.orderId,
        orderNumber: transferData.orderNumber,
        celebrityName: transferData.celebrityName,
        originalAmount: transferData.amount.toString(),
        platformFee: platformFee.toString(),
        platformFeePercentage: platformFeePercentage.toString(),
        trigger: "customer_approval",
      },
    })

    console.log("✅ Approved booking transfer successful:", transfer.id)

    return {
      transferId: transfer.id,
      celebrityAmount,
      platformFee,
    }
  } catch (error) {
    console.error("❌ Failed to transfer approved booking payment:", error)
    throw new Error(`Failed to transfer booking payment: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Transfer tip to celebrity (100% to celebrity) - ONLY AFTER VIDEO APPROVAL
 */
export const transferTipPayment = async (transferData: {
  accountId: string
  amount: number // Tip amount in cents
  currency: string
  tipId: string
  orderId: string
  orderNumber: string
  celebrityName: string
  customerName: string
}): Promise<{ transferId: string }> => {
  try {
     console.log("🔍 Pre-transfer validation:", {
      accountId: transferData.accountId,
      amount: transferData.amount,
      currency: transferData.currency
    });
    console.log(`🔄 Transferring tip payment AFTER VIDEO APPROVAL:`)
    console.log(`   Tip Amount: $${transferData.amount / 100}`)
    console.log(`   Celebrity gets: $${transferData.amount / 100} (100%)`)

    const transfer = await stripe.transfers.create({
      amount: transferData.amount, // 100% to celebrity
      currency: transferData.currency,
      destination: transferData.accountId,
      description: `Tip from ${transferData.customerName} for approved order ${transferData.orderNumber}`,
      metadata: {
        type: "approved_tip_payment",
        tipId: transferData.tipId,
        orderId: transferData.orderId,
        orderNumber: transferData.orderNumber,
        celebrityName: transferData.celebrityName,
        customerName: transferData.customerName,
        trigger: "video_approval",
      },
    })

    console.log("✅ Approved tip transfer successful:", transfer.id)

    return {
      transferId: transfer.id,
    }
  } catch (error) {
    console.error("❌ Failed to transfer approved tip payment:", error)
    throw new Error(`Failed to transfer tip payment: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Process all pending transfers for an approved order
 */
export const processApprovedOrderTransfers = async (orderData: {
  orderId: string
  orderNumber: string
  celebrityId: string
  celebrityName: string
  stripeConnectAccountId: string
  totalAmount: number // in cents
  platformFeePercentage?: number
}): Promise<{
  bookingTransfer: { transferId: string; celebrityAmount: number; platformFee: number }
  tipTransfers: { transferId: string; tipId: string; amount: number }[]
}> => {
  try {
    console.log("🔄 Processing all transfers for approved order:", orderData.orderNumber)

    // 1. Transfer main booking payment
    const bookingTransfer = await transferBookingPayment({
      accountId: orderData.stripeConnectAccountId,
      amount: orderData.totalAmount,
      currency: "nzd",
      orderId: orderData.orderId,
      orderNumber: orderData.orderNumber,
      celebrityName: orderData.celebrityName,
      platformFeePercentage: orderData.platformFeePercentage,
    })

    // 2. Transfer any pending tips for this order
    const tipTransfers: { transferId: string; tipId: string; amount: number }[] = []

    // Note: This would need to be called from the approval API route
    // where we have access to the database to fetch pending tips

    console.log("✅ All transfers processed for approved order")

    return {
      bookingTransfer,
      tipTransfers,
    }
  } catch (error) {
    console.error("❌ Failed to process approved order transfers:", error)
    throw new Error(`Failed to process transfers: ${error instanceof Error ? error.message : "Unknown error"}`)
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

/**
 * Get account balance
 */
export const getAccountBalance = async (accountId: string) => {
  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: accountId,
    })
    return balance
  } catch (error) {
    console.error("❌ Failed to get account balance:", error)
    throw new Error(`Failed to get account balance: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Create payment intent
 */
export const createPaymentIntent = async (amount: number, currency = "nzd", metadata: Record<string, string> = {}) => {
  try {
    console.log(`🔄 Creating payment intent: $${amount / 100}`)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Ensure it's an integer
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    console.log("✅ Payment intent created:", paymentIntent.id)
    return paymentIntent
  } catch (error) {
    console.error("❌ Failed to create payment intent:", error)
    throw new Error(`Failed to create payment intent: ${error instanceof Error ? error.message : "Unknown error"}`)
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
  // Ensure platformFeePercentage is a number
  const feePercentage =
    typeof platformFeePercentage === "string" ? Number.parseFloat(platformFeePercentage) : platformFeePercentage

  const platformFee = Math.round(totalAmount * (feePercentage / 100))
  const celebrityAmount = totalAmount - platformFee

  return {
    platformFee,
    celebrityAmount,
  }
}

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number, currency = "nzd"): string => {
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

export const isCountrySupported = (countryCode: string): boolean => {
  return getSupportedCountries().includes(countryCode.toUpperCase())
}
