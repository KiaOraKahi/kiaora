import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get financial settings
    const financialSettings = await prisma.financialSettings.findFirst({
      select: {
        id: true,
        adminStripeAccountId: true,
        adminStripeAccountStatus: true,
        adminStripeAccountEmail: true,
        adminStripeAccountName: true,
        platformFeeBalance: true,
        lastPlatformFeePayout: true,
      },
    })

    if (!financialSettings) {
      return NextResponse.json({ error: "Financial settings not found" }, { status: 404 })
    }

    // If no Stripe account exists
    if (!financialSettings.adminStripeAccountId) {
      return NextResponse.json({
        hasAccount: false,
        accountStatus: "PENDING",
        payoutsEnabled: false,
        chargesEnabled: false,
        requirementsCount: 0,
        platformFeeBalance: financialSettings.platformFeeBalance || 0,
        lastPlatformFeePayout: financialSettings.lastPlatformFeePayout,
      })
    }

    // Get account details from Stripe
    try {
      const account = await stripe.accounts.retrieve(financialSettings.adminStripeAccountId)

      const requirementsCount = account.requirements?.currently_due?.length || 0
      const payoutsEnabled = account.payouts_enabled || false
      const chargesEnabled = account.charges_enabled || false

      // Determine account status
      let accountStatus: "PENDING" | "RESTRICTED" | "ACTIVE" | "REJECTED" = "PENDING"

      if (account.details_submitted && payoutsEnabled && chargesEnabled) {
        accountStatus = "ACTIVE"
      } else if (account.details_submitted && !payoutsEnabled) {
        accountStatus = "RESTRICTED"
      } else if (requirementsCount > 0) {
        accountStatus = "PENDING"
      }

      // Update financial settings if status changed
      if (financialSettings.adminStripeAccountStatus !== accountStatus) {
        await prisma.financialSettings.update({
          where: { id: financialSettings.id },
          data: {
            adminStripeAccountStatus: accountStatus,
          },
        })
      }

      return NextResponse.json({
        hasAccount: true,
        accountId: financialSettings.adminStripeAccountId,
        accountStatus,
        payoutsEnabled,
        chargesEnabled,
        requirementsCount,
        platformFeeBalance: financialSettings.platformFeeBalance || 0,
        lastPlatformFeePayout: financialSettings.lastPlatformFeePayout,
        accountEmail: financialSettings.adminStripeAccountEmail,
        accountName: financialSettings.adminStripeAccountName,
      })
    } catch (stripeError) {
      console.error("Error fetching Stripe account:", stripeError)
      return NextResponse.json({
        hasAccount: true,
        accountId: financialSettings.adminStripeAccountId,
        accountStatus: financialSettings.adminStripeAccountStatus || "PENDING",
        payoutsEnabled: false,
        chargesEnabled: false,
        requirementsCount: 0,
        platformFeeBalance: financialSettings.platformFeeBalance || 0,
        lastPlatformFeePayout: financialSettings.lastPlatformFeePayout,
        accountEmail: financialSettings.adminStripeAccountEmail,
        accountName: financialSettings.adminStripeAccountName,
        error: "Failed to fetch Stripe account details",
      })
    }
  } catch (error) {
    console.error("Error in admin Stripe status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
