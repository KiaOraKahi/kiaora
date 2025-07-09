import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { paymentIntentId } = await request.json()

    if (!paymentIntentId) {
      return NextResponse.json({ error: "paymentIntentId required" }, { status: 400 })
    }

    console.log("🧪 MANUAL WEBHOOK TRIGGER")
    console.log("   - Payment Intent ID:", paymentIntentId)
    console.log("   - Triggered by:", session.user.email)

    // Get the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    console.log("📋 Payment Intent Details:")
    console.log("   - Status:", paymentIntent.status)
    console.log("   - Amount:", paymentIntent.amount)
    console.log("   - Currency:", paymentIntent.currency)
    console.log("   - Metadata:", paymentIntent.metadata)

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        {
          error: "Payment intent has not succeeded",
          status: paymentIntent.status,
          paymentIntent: {
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            metadata: paymentIntent.metadata,
          },
        },
        { status: 400 },
      )
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { paymentIntentId },
      include: {
        booking: true,
        celebrity: {
          include: { user: true },
        },
        user: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found for payment intent",
          paymentIntentId,
        },
        { status: 404 },
      )
    }

    console.log("✅ Order found:", order.orderNumber)
    console.log("   - Current payment status:", order.paymentStatus)
    console.log("   - Current order status:", order.status)

    // Manually trigger the webhook processing
    const result = await processPaymentSuccess(paymentIntent, order)

    return NextResponse.json({
      success: true,
      message: "Webhook processing completed manually",
      paymentIntentId,
      orderNumber: order.orderNumber,
      result,
    })
  } catch (error) {
    console.error("❌ Manual webhook trigger error:", error)
    return NextResponse.json(
      {
        error: "Manual webhook trigger failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Extract the payment processing logic so we can reuse it
async function processPaymentSuccess(paymentIntent: any, order: any) {
  console.log("🔄 PROCESSING PAYMENT SUCCESS MANUALLY")

  try {
    // Calculate payment split (80/20)
    const platformFeePercentage = 20
    const platformFee = Math.round(paymentIntent.amount * (platformFeePercentage / 100))
    const celebrityAmount = paymentIntent.amount - platformFee

    console.log("💰 PAYMENT SPLIT:")
    console.log("   - Total:", paymentIntent.amount, "cents")
    console.log("   - Platform Fee (20%):", platformFee, "cents")
    console.log("   - Celebrity Amount (80%):", celebrityAmount, "cents")

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "SUCCEEDED",
        status: "CONFIRMED",
        paidAt: new Date(),
        platformFee: platformFee / 100, // Convert to dollars
        celebrityAmount: celebrityAmount / 100, // Convert to dollars
      },
    })

    console.log("✅ Order updated successfully")

    // Create booking if it doesn't exist
    let booking = order.booking
    if (!booking) {
      console.log("🎬 Creating booking...")

      booking = await prisma.booking.create({
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          userId: order.userId,
          celebrityId: order.celebrityId,
          message: order.personalMessage,
          recipientName: order.recipientName,
          occasion: order.occasion,
          instructions: order.specialInstructions || null,
          specialInstructions: order.specialInstructions || null,
          status: "PENDING",
          price: order.totalAmount,
          totalAmount: order.totalAmount,
          scheduledDate: order.scheduledDate,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
      })

      console.log("✅ Booking created:", booking.id)
    } else {
      console.log("🔄 Updating existing booking...")
    }

    return {
      orderUpdated: true,
      bookingCreated: !order.booking,
      bookingId: booking.id,
      paymentStatus: updatedOrder.paymentStatus,
      orderStatus: updatedOrder.status,
      platformFee: updatedOrder.platformFee,
      celebrityAmount: updatedOrder.celebrityAmount,
    }
  } catch (error) {
    console.error("❌ Error processing payment success:", error)
    throw error
  }
}