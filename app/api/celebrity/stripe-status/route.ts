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
      },
    })

    if (!celebrity) {
      return NextResponse.json({ error: "Celebrity profile not found" }, { status: 404 })
    }

    // Calculate dynamic balances
    // 1. Total Earnings - sum of all completed payouts
    const totalEarningsResult = await prisma.payout.aggregate({
      where: { celebrityId: celebrity.id },
      _sum: { amount: true },
    })

    // 2. Pending Earnings - completed orders awaiting payout (90% of order total)
    const pendingOrdersResult = await prisma.order.aggregate({
      where: {
        celebrityId: celebrity.id,
        status: "COMPLETED",
        payoutStatus: "PENDING",
      },
      _sum: { totalAmount: true },
    })

    // 3. Total Tips - sum of all successful tips
    const totalTipsResult = await prisma.tip.aggregate({
      where: {
        celebrityId: celebrity.id,
        paymentStatus: "SUCCEEDED",
      },
      _sum: { amount: true },
    })

    // Calculate pending earnings (90% of pending orders)
    let pendingEarnings = Math.round((pendingOrdersResult._sum.totalAmount || 0) * 0.9)

    // Add Stripe available balance to pending earnings if account exists
    if (celebrity.stripeConnectAccountId) {
      try {
        const balance = await stripe.balance.retrieve({
          stripeAccount: celebrity.stripeConnectAccountId,
        })
        
        if (balance.available && balance.available.length > 0) {
          const stripeAvailable = balance.available.reduce((sum, bal) => {
            return sum + (bal.currency === 'nzd' ? bal.amount : bal.amount)
          }, 0)
          pendingEarnings += stripeAvailable
        }
      } catch (error) {
        console.warn("Could not fetch Stripe balance for pending calculation:", error)
      }
    }

    const calculatedBalances = {
      totalEarnings: totalEarningsResult._sum.amount || 0,
      pendingEarnings: pendingEarnings,
      totalTips: totalTipsResult._sum.amount || 0,
    }

    // If no Stripe account exists
    if (!celebrity.stripeConnectAccountId) {
      return NextResponse.json({
        hasAccount: false,
        accountStatus: "PENDING",
        payoutsEnabled: false,
        chargesEnabled: false,
        requirementsCount: 0,
        ...calculatedBalances,
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
        ...calculatedBalances,
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
        ...calculatedBalances,
      })
    }
  } catch (error) {
    console.error("Error fetching Stripe status:", error)
    return NextResponse.json({ error: "Failed to fetch Stripe status" }, { status: 500 })
  }
}