import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderNumber } = await params

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
        user: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized to approve this order" }, { status: 403 })
    }

    if (order.status !== "PENDING_APPROVAL") {
      return NextResponse.json(
        { error: `Order cannot be approved. Current status: ${order.status}` },
        { status: 400 }
      )
    }

    // Check if celebrity has Stripe Connect account
    if (!order.celebrity.stripeConnectAccountId) {
      return NextResponse.json(
        { error: "Celebrity payment account not set up" },
        { status: 400 }
      )
    }

    // Use the order's actual currency instead of hardcoded "nzd"
    const currency = order.currency.toLowerCase()
    
    // Amounts (in cents)
    const originalAmount = Math.round(order.totalAmount * 100)
    const platformFee = Math.round(originalAmount * 0.2) // 20% platform fee
    const celebrityAmount = originalAmount - platformFee

    // Create a direct transfer to the celebrity's account
    // This transfers the money that was already paid by the customer
    const transfer = await stripe.transfers.create({
      amount: celebrityAmount,
      currency: currency,
      destination: order.celebrity.stripeConnectAccountId,
      description: `Payment for order ${orderNumber} - ${order.celebrity.user.name}`,
      metadata: {
        orderId: order.id.toString(),
        orderNumber,
        celebrityId: order.celebrityId.toString(),
        platformFee: (platformFee / 100).toString(),
        celebrityEarnings: (celebrityAmount / 100).toString(),
        transferType: "manual_transfer",
      },
    })

    // Update order status and store the transfer ID
    // Status is COMPLETED and transfer is initiated
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "COMPLETED",
        approvalStatus: "APPROVED",
        approvedAt: new Date(),
        platformFee: platformFee / 100,
        celebrityAmount: celebrityAmount / 100,
        transferStatus: "IN_TRANSIT", // Transfer is now in transit
      },
    })

    // Create payout record with transfer ID
    await prisma.payout.create({
      data: {
        celebrityId: order.celebrityId,
        orderId: order.id,
        amount: celebrityAmount / 100,
        platformFee: platformFee / 100,
        currency: currency,
        stripeTransferId: transfer.id, // Set the transfer ID immediately
        status: "IN_TRANSIT", // Transfer is now in transit
      },
    })

    // Create transfer record in database
    await prisma.transfer.create({
      data: {
        stripeTransferId: transfer.id,
        celebrityId: order.celebrityId,
        orderId: order.id,
        amount: celebrityAmount,
        currency: currency,
        type: "BOOKING_PAYMENT",
        status: "IN_TRANSIT",
        description: `Payment for order ${orderNumber} - ${order.celebrity.user.name}`,
        initiatedAt: new Date(),
      },
    })

    // Send notification email
    try {
      const emailResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/send-approval-emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "video_approved",
          orderNumber,
          celebrityEmail: order.celebrity.user.email,
          celebrityName: order.celebrity.user.name,
          customerName: order.user.name,
          amount: celebrityAmount / 100,
          tipAmount: 0,
          hasReview: false,
        }),
      })

      if (!emailResponse.ok) {
        console.error("Failed to send approval email:", await emailResponse.text())
      }
    } catch (emailError) {
      console.error("Error sending approval email:", emailError)
    }

    return NextResponse.json({
      success: true,
      message: "Video approved and payment transferred successfully",
      data: {
        orderNumber,
        status: "COMPLETED",
        approvalStatus: "APPROVED",
        transferId: transfer.id,
        celebrityEarnings: celebrityAmount / 100,
        platformFee: platformFee / 100,
      },
    })
  } catch (error: any) {
    console.error("Approval processing error:", error)
    
    // Log more detailed error information
    if (error instanceof Stripe.errors.StripeError) {
      console.error("Stripe error details:", {
        type: error.type,
        code: error.code,
        message: error.message,
        decline_code: (error as any).decline_code,
        param: (error as any).param,
      })
    }
    
    return NextResponse.json(
      {
        error: "Failed to process approval",
        details: error.message,
      },
      { status: 500 }
    )
  }
}
