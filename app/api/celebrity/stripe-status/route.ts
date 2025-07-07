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

    // Find celebrity profile
    const celebrity = await prisma.celebrity.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        stripeConnectAccountId: true,
        stripeAccountStatus: true,
        stripePayoutsEnabled: true,
        totalEarnings: true,
        pendingEarnings: true,
        totalTips: true,
      },
    })

    if (!celebrity) {
      return NextResponse.json({ error: "Celebrity profile not found" }, { status: 404 })
    }

    // If no Stripe account exists
    if (!celebrity.stripeConnectAccountId) {
      return NextResponse.json({
        hasAccount: false,
        accountStatus: "PENDING",
        payoutsEnabled: false,
        chargesEnabled: false,
        requirementsCount: 0,
        totalEarnings: celebrity.totalEarnings || 0,
        pendingEarnings: celebrity.pendingEarnings || 0,
        totalTips: celebrity.totalTips || 0,
      })
    }

    // Get account details from Stripe
    try {
      const account = await stripe.accounts.retrieve(celebrity.stripeConnectAccountId)

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

      // Update celebrity record if status changed
      if (celebrity.stripeAccountStatus !== accountStatus || celebrity.stripePayoutsEnabled !== payoutsEnabled) {
        await prisma.celebrity.update({
          where: { id: celebrity.id },
          data: {
            stripeAccountStatus: accountStatus,
            stripePayoutsEnabled: payoutsEnabled,
          },
        })
      }

      return NextResponse.json({
        hasAccount: true,
        accountId: celebrity.stripeConnectAccountId,
        accountStatus,
        payoutsEnabled,
        chargesEnabled,
        requirementsCount,
        totalEarnings: celebrity.totalEarnings || 0,
        pendingEarnings: celebrity.pendingEarnings || 0,
        totalTips: celebrity.totalTips || 0,
      })
    } catch (stripeError) {
      console.error("Error fetching Stripe account:", stripeError)

      return NextResponse.json({
        hasAccount: true,
        accountId: celebrity.stripeConnectAccountId,
        accountStatus: celebrity.stripeAccountStatus || "PENDING",
        payoutsEnabled: celebrity.stripePayoutsEnabled || false,
        chargesEnabled: false,
        requirementsCount: 0,
        totalEarnings: celebrity.totalEarnings || 0,
        pendingEarnings: celebrity.pendingEarnings || 0,
        totalTips: celebrity.totalTips || 0,
      })
    }
  } catch (error) {
    console.error("Error fetching Stripe status:", error)
    return NextResponse.json({ error: "Failed to fetch Stripe status" }, { status: 500 })
  }
}