import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get("orderNumber")
    const paymentIntentId = searchParams.get("paymentIntentId")

    if (!orderNumber && !paymentIntentId) {
      return NextResponse.json({ error: "orderNumber or paymentIntentId required" }, { status: 400 })
    }

    console.log("🔍 DEBUG: Searching for order...")
    console.log("   - Order Number:", orderNumber)
    console.log("   - Payment Intent ID:", paymentIntentId)

    // Find order by orderNumber or paymentIntentId
    const whereClause = orderNumber ? { orderNumber } : { paymentIntentId }

    const order = await prisma.order.findFirst({
      where: whereClause,
      include: {
        booking: true,
        celebrity: {
          include: { user: true },
        },
        user: true,
        items: true,
        tips: true,
        transfers: true,
      },
    })

    if (!order) {
      console.log("❌ Order not found")

      // Show recent orders for debugging
      const recentOrders = await prisma.order.findMany({
        where: { userId: session.user.id },
        select: {
          id: true,
          orderNumber: true,
          paymentIntentId: true,
          paymentStatus: true,
          status: true,
          createdAt: true,
          totalAmount: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      })

      return NextResponse.json({
        error: "Order not found",
        recentOrders,
        searchCriteria: { orderNumber, paymentIntentId },
      })
    }

    console.log("✅ Order found:", order.orderNumber)

    // Get webhook logs (if any)
    const webhookLogs = await getRecentWebhookLogs()

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        paymentIntentId: order.paymentIntentId,
        paymentStatus: order.paymentStatus,
        status: order.status,
        totalAmount: order.totalAmount,
        platformFee: order.platformFee,
        celebrityAmount: order.celebrityAmount,
        transferStatus: order.transferStatus,
        transferId: order.transferId,
        paidAt: order.paidAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
      booking: order.booking
        ? {
            id: order.booking.id,
            status: order.booking.status,
            createdAt: order.booking.createdAt,
          }
        : null,
      celebrity: {
        id: order.celebrity.id,
        name: order.celebrity.user.name,
        stripeConnectAccountId: order.celebrity.stripeConnectAccountId,
        stripePayoutsEnabled: order.celebrity.stripePayoutsEnabled,
      },
      items: order.items,
      tips: order.tips,
      transfers: order.transfers,
      webhookLogs,
    })
  } catch (error) {
    console.error("❌ Debug endpoint error:", error)
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Helper function to get recent webhook logs (you might need to implement this based on your logging setup)
async function getRecentWebhookLogs() {
  // This is a placeholder - you might want to implement actual webhook logging
  return {
    note: "Webhook logs would appear here if logging is implemented",
    suggestion: "Check your server logs or implement webhook event logging in database",
  }
}
