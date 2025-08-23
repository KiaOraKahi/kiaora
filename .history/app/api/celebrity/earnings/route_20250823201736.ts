import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get celebrity profile
    const celebrity = await prisma.celebrity.findUnique({
      where: { userId: session.user.id },
    })

    if (!celebrity) {
      return NextResponse.json({ error: "Celebrity profile not found" }, { status: 404 })
    }

    // Get earnings summary
    const totalEarnings = await prisma.payout.aggregate({
      where: { celebrityId: celebrity.id },
      _sum: { amount: true },
    })

    const pendingEarnings = await prisma.order.aggregate({
      where: {
        celebrityId: celebrity.id,
        status: "COMPLETED",
        payoutStatus: "PENDING",
      },
      _sum: { totalAmount: true },
    })

    // Get recent payouts
    const recentPayouts = await prisma.payout.findMany({
      where: { celebrityId: celebrity.id },
      include: {
        order: {
          select: {
            orderNumber: true,
            recipientName: true,
            totalAmount: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    // Get pending orders
    const pendingOrders = await prisma.order.findMany({
      where: {
        celebrityId: celebrity.id,
        status: "COMPLETED",
        payoutStatus: "PENDING",
      },
      select: {
        id: true,
        orderNumber: true,
        recipientName: true,
        totalAmount: true,
        createdAt: true,
        deliveredAt: true,
      },
      orderBy: { deliveredAt: "desc" },
    })

    // Get Stripe account balance if available
    let stripeBalance = null
    if (celebrity.stripeConnectAccountId) {
      try {
        const balance = await stripe.balance.retrieve({
          stripeAccount: celebrity.stripeConnectAccountId,
        })
        stripeBalance = {
          available: balance.available,
          pending: balance.pending,
        }
      } catch (error) {
        console.warn("Could not fetch Stripe balance:", error)
      }
    }

    // Calculate platform fees (10% of total earnings)
    const totalPlatformFees = await prisma.payout.aggregate({
      where: { celebrityId: celebrity.id },
      _sum: { platformFee: true },
    })

    // Calculate total pending earnings including Stripe balance
    let totalPendingEarnings = Math.round((pendingEarnings._sum.totalAmount || 0) * 0.9)
    
    // Add Stripe available balance to pending earnings
    if (stripeBalance?.available && stripeBalance.available.length > 0) {
      const stripeAvailable = stripeBalance.available.reduce((sum, bal) => {
        return sum + (bal.currency === 'usd' ? bal.amount / 100 : bal.amount / 100)
      }, 0)
      totalPendingEarnings += stripeAvailable
    }

    const response = {
      summary: {
        totalEarnings: totalEarnings._sum.amount || 0,
        pendingEarnings: totalPendingEarnings,
        totalPlatformFees: totalPlatformFees._sum.platformFee || 0,
        totalPayouts: recentPayouts.length,
      },
      stripeBalance,
      recentPayouts: recentPayouts.map((payout) => ({
        id: payout.id,
        amount: payout.amount,
        platformFee: payout.platformFee,
        status: payout.status,
        paidAt: payout.paidAt?.toISOString(),
        createdAt: payout.createdAt.toISOString(),
        order: {
          orderNumber: payout.order.orderNumber,
          recipientName: payout.order.recipientName,
          totalAmount: payout.order.totalAmount,
          createdAt: payout.order.createdAt.toISOString(),
        },
      })),
      pendingOrders: pendingOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        recipientName: order.recipientName,
        totalAmount: order.totalAmount,
        expectedPayout: Math.round(order.totalAmount * 0.9),
        createdAt: order.createdAt.toISOString(),
        deliveredAt: order.deliveredAt?.toISOString(),
      })),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Error fetching earnings:", error)
    return NextResponse.json({ error: "Failed to fetch earnings" }, { status: 500 })
  }
}

// Request payout for pending earnings
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderIds } = await request.json()

    if (!orderIds || !Array.isArray(orderIds)) {
      return NextResponse.json({ error: "Order IDs required" }, { status: 400 })
    }

    // Get celebrity profile
    const celebrity = await prisma.celebrity.findUnique({
      where: { userId: session.user.id },
    })

    if (!celebrity?.stripeConnectAccountId) {
      return NextResponse.json({ error: "Stripe account not connected" }, { status: 400 })
    }

    // Process payouts for each order
    const results = []
    for (const orderId of orderIds) {
      const order = await prisma.order.findUnique({
        where: {
          id: orderId,
          celebrityId: celebrity.id,
          status: "COMPLETED",
          payoutStatus: "PENDING",
        },
      })

      if (order) {
        // Calculate amounts
        const platformFee = Math.round(order.totalAmount * 0.1)
        const celebrityAmount = order.totalAmount - platformFee

        try {
          // Create Stripe transfer
          const transfer = await stripe.transfers.create({
            amount: celebrityAmount,
            currency: "usd",
            destination: celebrity.stripeConnectAccountId,
            metadata: {
              orderId: order.id,
              celebrityId: celebrity.id,
              platformFee: platformFee.toString(),
            },
          })

          // Record payout
          await prisma.payout.create({
            data: {
              celebrityId: celebrity.id,
              orderId: order.id,
              amount: celebrityAmount,
              platformFee,
              stripeTransferId: transfer.id,
              status: "PAID",
              paidAt: new Date(),
            },
          })

          // Update order
          await prisma.order.update({
            where: { id: orderId },
            data: { payoutStatus: "PAID" },
          })

          results.push({
            orderId,
            success: true,
            amount: celebrityAmount,
            transferId: transfer.id,
          })
        } catch (error) {
          console.error(`❌ Error processing payout for order ${orderId}:`, error)
          results.push({
            orderId,
            success: false,
            error: "Failed to process payout",
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      processed: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    })
  } catch (error) {
    console.error("❌ Error processing payouts:", error)
    return NextResponse.json({ error: "Failed to process payouts" }, { status: 500 })
  }
}