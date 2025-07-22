import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { stripe, calculatePaymentSplit } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderNumber, amount, message } = await request.json()

    console.log("💰 Creating tip payment for order:", orderNumber)
    console.log("💵 Tip amount:", amount)

    // Validate tip amount
    if (!amount || amount < 1 || amount > 1000) {
      return NextResponse.json({ error: "Invalid tip amount. Must be between $1 and $1000" }, { status: 400 })
    }

    // Find the order and verify ownership
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        celebrity: {
          include: { user: true },
        },
        user: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Verify the user owns this order
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized - not your order" }, { status: 403 })
    }

    // 🔥 NEW: Check if video has been approved by customer
    console.log("🔍 Checking video approval status...")
    console.log("   - Order Status:", order.status)
    console.log("   - Approval Status:", order.approvalStatus)
    console.log("   - Video URL:", order.videoUrl ? "Present" : "Missing")

    // Only allow tips after video has been approved
    if (order.approvalStatus !== "APPROVED") {
      console.log("❌ Tips not allowed - video not approved yet")

      let errorMessage = "Tips are only allowed after you approve the video."

      if (order.approvalStatus === "PENDING_APPROVAL") {
        errorMessage = "Please review and approve the video before sending a tip."
      } else if (order.approvalStatus === "DECLINED") {
        errorMessage = "Video is being revised. Tips will be available after you approve the new version."
      } else if (order.approvalStatus === "REVISION_REQUESTED") {
        errorMessage = "Celebrity is working on revisions. Tips will be available after you approve the video."
      }

      return NextResponse.json(
        {
          error: errorMessage,
          approvalRequired: true,
          currentStatus: order.approvalStatus,
        },
        { status: 400 },
      )
    }

    // Additional check: Order must be completed
    if (order.status !== "COMPLETED") {
      return NextResponse.json(
        {
          error: "Tips are only allowed for completed orders with approved videos.",
          orderStatus: order.status,
        },
        { status: 400 },
      )
    }

    console.log("✅ Order and approval validation passed")

    // Check if celebrity has Stripe Connect account
    const celebrity = order.celebrity
    const canTransfer = celebrity.stripeConnectAccountId && celebrity.stripePayoutsEnabled

    console.log("🎭 Celebrity Connect status:", {
      hasAccount: !!celebrity.stripeConnectAccountId,
      payoutsEnabled: celebrity.stripePayoutsEnabled,
      canTransfer,
    })

    // Calculate tip split (100% to celebrity for tips - 0% platform fee)
    const { celebrityAmount, platformFee } = calculatePaymentSplit(amount, 0)

    console.log("💰 Tip breakdown:", {
      totalAmount: amount,
      celebrityAmount,
      platformFee,
    })

    // Create tip record in database
    const tip = await prisma.tip.create({
      data: {
        orderId: order.id,
        userId: session.user.id,
        celebrityId: celebrity.id,
        amount: amount,
        currency: "usd",
        message: message || null,
        paymentStatus: "PENDING",
      },
    })

    console.log("✅ Tip record created:", tip.id)

    // Create Stripe payment intent for tip
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      metadata: {
        type: "tip",
        tipId: tip.id,
        orderId: order.id,
        orderNumber: order.orderNumber,
        celebrityId: celebrity.id,
        userId: session.user.id,
        celebrityName: celebrity.user.name || "Unknown",
        customerName: order.user.name || "Unknown",
        celebrityAmount: celebrityAmount.toString(),
        platformFee: platformFee.toString(),
        canTransfer: canTransfer?.toString() || "",
        stripeConnectAccountId: celebrity.stripeConnectAccountId || "",
        // NEW: Add approval metadata
        approvalStatus: order.approvalStatus,
        approvedAt: order.approvedAt?.toISOString() || "",
        videoApproved: "true", // Confirmed approved at this point
      },
      description: `Tip for ${celebrity.user.name} - Order ${order.orderNumber} (Video Approved)`,
    })

    console.log("✅ Stripe PaymentIntent created for tip:", paymentIntent.id)

    // Update tip with payment intent ID
    await prisma.tip.update({
      where: { id: tip.id },
      data: {
        paymentIntentId: paymentIntent.id,
      },
    })

    console.log("✅ Tip payment intent created successfully for approved video")

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      tipId: tip.id,
      amount: amount,
      celebrityName: celebrity.user.name,
      approvalStatus: order.approvalStatus,
      message: "Tip created for approved video",
    })
  } catch (error) {
    console.error("❌ Tip payment creation error:", error)
    return NextResponse.json(
      {
        error: "Failed to create tip payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// GET endpoint to fetch tips for an order
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get("orderNumber")

    if (!orderNumber) {
      return NextResponse.json({ error: "Order number required" }, { status: 400 })
    }

    // Find the order and verify ownership
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        id: true,
        userId: true,
        approvalStatus: true,
        status: true,
        videoUrl: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Verify the user owns this order
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get all tips for this order
    const tips = await prisma.tip.findMany({
      where: { orderId: order.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        amount: true,
        currency: true,
        message: true,
        paymentStatus: true,
        createdAt: true,
        paidAt: true,
      },
    })

    // Calculate total tips (only successful ones)
    const totalTips = tips.filter((tip) => tip.paymentStatus === "SUCCEEDED").reduce((sum, tip) => sum + tip.amount, 0)

    console.log("📊 Tips fetched for order:", {
      orderNumber,
      approvalStatus: order.approvalStatus,
      tipCount: tips.length,
      totalTips,
      videoApproved: order.approvalStatus === "APPROVED",
    })

    return NextResponse.json({
      success: true,
      tips,
      totalTips,
      tipCount: tips.length,
      // NEW: Include approval info for client-side validation
      orderStatus: order.status,
      approvalStatus: order.approvalStatus,
      videoApproved: order.approvalStatus === "APPROVED",
      hasVideo: !!order.videoUrl,
    })
  } catch (error) {
    console.error("❌ Error fetching tips:", error)
    return NextResponse.json({ error: "Failed to fetch tips" }, { status: 500 })
  }
}
