import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Check financial settings
    const financialSettings = await prisma.financialSettings.findFirst()
    
    if (!financialSettings) {
      return NextResponse.json({ 
        error: "No financial settings found",
        suggestion: "Run the database initialization script"
      }, { status: 404 })
    }

    // Check if admin Stripe account exists
    if (!financialSettings.adminStripeAccountId) {
      return NextResponse.json({
        status: "no_account",
        message: "No admin Stripe account configured",
        financialSettings: {
          id: financialSettings.id,
          platformFee: financialSettings.platformFee,
          adminStripeAccountStatus: financialSettings.adminStripeAccountStatus
        }
      })
    }

    // Try to retrieve the Stripe account
    try {
      const account = await stripe.accounts.retrieve(financialSettings.adminStripeAccountId)
      
      return NextResponse.json({
        status: "success",
        financialSettings: {
          id: financialSettings.id,
          adminStripeAccountId: financialSettings.adminStripeAccountId,
          adminStripeAccountStatus: financialSettings.adminStripeAccountStatus,
          adminStripeAccountEmail: financialSettings.adminStripeAccountEmail,
          adminStripeAccountName: financialSettings.adminStripeAccountName,
          platformFeeBalance: financialSettings.platformFeeBalance
        },
        stripeAccount: {
          id: account.id,
          object: account.object,
          details_submitted: account.details_submitted,
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          requirements: account.requirements
        }
      })
    } catch (stripeError) {
      return NextResponse.json({
        status: "stripe_error",
        message: "Failed to retrieve Stripe account",
        error: stripeError instanceof Error ? stripeError.message : "Unknown error",
        financialSettings: {
          id: financialSettings.id,
          adminStripeAccountId: financialSettings.adminStripeAccountId,
          adminStripeAccountStatus: financialSettings.adminStripeAccountStatus
        }
      })
    }

  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
