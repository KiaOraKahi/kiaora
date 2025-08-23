import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderNumber, tipAmount = 0, rating, reviewText } = await request.json()

    // Validate input
    if (!orderNumber) {
      return NextResponse.json({ error: "Order number is required" }, { status: 400 })
    }

    if (tipAmount < 0) {
      return NextResponse.json({ error: "Tip amount cannot be negative" }, { status: 400 })
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Get the order with celebrity info
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        celebrity: {
          include: {
            user: true,
          },
        },
        user: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Verify the user owns this order
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized to approve this order" }, { status: 403 })
    }

    // Check if order is in the right status
    if (order.status !== "PENDING_APPROVAL") {
      return NextResponse.json(
        {
          error: `Order cannot be approved. Current status: ${order.status}`,
        },
        { status: 400 },
      )
    }

    // Check if celebrity has Stripe Connect account
    if (!order.celebrity.stripeConnectAccountId) {
      return NextResponse.json(
        {
          error: "Celebrity payment account not set up. They need to complete Stripe Connect onboarding.",
        },
        { status: 400 },
      )
    }

    // Calculate amounts (in cents)
    const originalAmount = Math.round(order.totalAmount * 100) // Use totalAmount instead of amount
    const tipAmountCents = Math.round(tipAmount * 100)
    const totalAmount = originalAmount + tipAmountCents

    // Platform fee (20% of original amount - standard platform fee)
    const platformFee = Math.round(originalAmount * 0.2)
    const celebrityAmount = originalAmount - platformFee + tipAmountCents

    console.log("💰 APPROVAL PAYMENT CALCULATION:")
    console.log("   - Original Amount:", originalAmount / 100, "NZD")
    console.log("   - Tip Amount:", tipAmount, "NZD")
    console.log("   - Platform Fee (20%):", platformFee / 100, "NZD")
    console.log("   - Celebrity Amount:", celebrityAmount / 100, "NZD")
    console.log("   - Celebrity Stripe Account:", order.celebrity.stripeConnectAccountId)

    try {
      // Start a database transaction
      const result = await prisma.$transaction(async (tx) => {
        // 1. Update order status
        const updatedOrder = await tx.order.update({
          where: { id: order.id },
          data: {
            status: "COMPLETED",
            approvalStatus: "APPROVED",
            approvedAt: new Date(),
            tipAmount: tipAmount,
            platformFee: platformFee / 100,
            celebrityAmount: celebrityAmount / 100,
            transferStatus: "IN_TRANSIT", // Mark as in transit
          },
        })

        // 2. Create review if provided
        let review = null
        if (rating) {
          review = await tx.review.create({
            data: {
              orderId: order.id,
              userId: session.user.id,
              celebrityId: order.celebrityId,
              rating: rating,
              comment: reviewText || null,
              isApproved: true, // Auto-approve reviews from completed orders
            },
          })
        }

        // 3. Create tip record if tip was given
        let tip = null
        if (tipAmount > 0) {
          tip = await tx.tip.create({
            data: {
              orderId: order.id,
              userId: session.user.id,
              celebrityId: order.celebrityId,
              amount: tipAmount,
              status: "COMPLETED",
            },
          })
        }

        // 4. Transfer money to celebrity via Stripe
        let transfer = null
        if (celebrityAmount > 0) {
          console.log("🔄 Creating Stripe transfer to celebrity...")
          
          transfer = await stripe.transfers.create({
            amount: celebrityAmount, // Already in cents
            currency: order.currency || "nzd", // Use order currency
            destination: order.celebrity.stripeConnectAccountId, // Correct field name
            description: `Payment for video order ${orderNumber}${tipAmount > 0 ? ` (includes $${tipAmount} tip)` : ""}`,
            metadata: {
              orderId: order.id.toString(),
              orderNumber: orderNumber,
              celebrityId: order.celebrityId.toString(),
              transferType: "approved_booking_payment",
              originalAmount: (originalAmount / 100).toString(),
              tipAmount: tipAmount.toString(),
              platformFee: (platformFee / 100).toString(),
              celebrityAmount: (celebrityAmount / 100).toString(),
            },
          })

          console.log("✅ Stripe transfer created successfully:", transfer.id)

          // Record the payout
          await tx.payout.create({
            data: {
              celebrityId: order.celebrityId,
              orderId: order.id,
              amount: celebrityAmount / 100,
              platformFee: platformFee / 100,
              currency: order.currency || "nzd",
              stripeTransferId: transfer.id,
              status: "IN_TRANSIT", // Transfer is in transit
              initiatedAt: new Date(),
            },
          })

          // Create transfer record in database
          await tx.transfer.create({
            data: {
              stripeTransferId: transfer.id,
              celebrityId: order.celebrityId,
              orderId: order.id,
              amount: celebrityAmount / 100,
              currency: order.currency || "nzd",
              type: "BOOKING_PAYMENT",
              status: "IN_TRANSIT",
              description: `Approved video payment for order ${orderNumber}`,
            },
          })

          console.log("✅ Transfer and payout records created in database")
        }

        return { updatedOrder, review, tip, transfer }
      })

      // 5. Send notification emails (outside transaction)
      try {
        // Email to celebrity about payment
        const emailResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/send-approval-emails`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "video_approved",
            orderNumber: orderNumber,
            celebrityEmail: order.celebrity.user.email,
            celebrityName: order.celebrity.user.name,
            customerName: order.user.name,
            amount: celebrityAmount / 100,
            tipAmount: tipAmount,
            hasReview: !!rating,
          }),
        })

        if (!emailResponse.ok) {
          console.error("Failed to send approval email:", await emailResponse.text())
        }
      } catch (emailError) {
        console.error("Error sending approval email:", emailError)
        // Don't fail the whole request for email errors
      }

      console.log("🎉 APPROVAL PAYMENT COMPLETED SUCCESSFULLY:")
      console.log("   - Order:", orderNumber, "marked as COMPLETED")
      console.log("   - Transfer ID:", result.transfer?.id)
      console.log("   - Celebrity will receive:", celebrityAmount / 100, "NZD")

      return NextResponse.json({
        success: true,
        message: "Video approved and payment processed successfully",
        data: {
          orderNumber: orderNumber,
          status: "COMPLETED",
          totalPaid: totalAmount / 100,
          celebrityEarnings: celebrityAmount / 100,
          platformFee: platformFee / 100,
          tipAmount: tipAmount,
          transferId: result.transfer?.id,
          reviewId: result.review?.id,
          tipId: result.tip?.id,
        },
      })
    } catch (stripeError: any) {
      console.error("❌ STRIPE TRANSFER ERROR:", stripeError)
      console.error("   - Error message:", stripeError.message)
      console.error("   - Error code:", stripeError.code)
      console.error("   - Error type:", stripeError.type)

      // Try to update order status back if Stripe fails
      try {
        await prisma.order.update({
          where: { id: order.id },
          data: { 
            status: "PENDING_APPROVAL",
            approvalStatus: "PENDING_APPROVAL",
            transferStatus: "PENDING"
          },
        })
        console.log("✅ Order status rolled back to PENDING_APPROVAL")
      } catch (rollbackError) {
        console.error("❌ Failed to rollback order status:", rollbackError)
      }

      return NextResponse.json(
        {
          error: "Payment processing failed",
          details: stripeError.message,
          code: stripeError.code,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("❌ APPROVAL PAYMENT PROCESSING ERROR:", error)
    return NextResponse.json(
      {
        error: "Failed to process approval payment",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// GET endpoint to check approval payment status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get("orderNumber")

    if (!orderNumber) {
      return NextResponse.json({ error: "Order number is required" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        celebrity: {
          include: {
            user: true,
          },
        },
        reviews: true,
        tips: true,
        payouts: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Verify the user owns this order
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({
      orderNumber: order.orderNumber,
      status: order.status,
      approvedAt: order.approvedAt,
      tipAmount: order.tipAmount,
      platformFee: order.platformFee,
      celebrityEarnings: order.celebrityEarnings,
      hasReview: order.reviews.length > 0,
      hasTip: order.tips.length > 0,
      payoutStatus: order.payouts[0]?.status || null,
      payoutProcessedAt: order.payouts[0]?.processedAt || null,
    })
  } catch (error: any) {
    console.error("Get approval payment status error:", error)
    return NextResponse.json(
      {
        error: "Failed to get approval payment status",
        details: error.message,
      },
      { status: 500 },
    )
  }
}