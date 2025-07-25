import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { sendBookingConfirmationToCustomer, sendBookingRejectionToCustomer } from "@/lib/email"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    console.log("🔍 Celebrity Booking Action API - Session:", {
      userId: session?.user?.id,
      bookingId: id,
    })

    if (!session?.user?.id) {
      console.log("❌ Celebrity Booking Action API - No session or user ID")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get celebrity profile
    const celebrity = await prisma.celebrity.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!celebrity) {
      console.log("❌ Celebrity profile not found for userId:", session.user.id)
      return NextResponse.json({ error: "Celebrity profile not found" }, { status: 404 })
    }

    // Get the action from request body
    const body = await request.json()
    const { action } = body

    console.log("🔍 Booking action requested:", { action, bookingId: id })

    if (!["accept", "decline"].includes(action)) {
      console.log("❌ Invalid action received:", action)
      return NextResponse.json({ error: "Invalid action. Must be 'accept' or 'decline'" }, { status: 400 })
    }

    // Find the booking and verify ownership
    const booking = await prisma.booking.findFirst({
      where: {
        id,
        celebrityId: celebrity.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            paymentStatus: true,
            paymentIntentId: true,
          },
        },
      },
    })

    if (!booking) {
      console.log("❌ Booking not found or not owned by celebrity:", { bookingId: id, celebrityId: celebrity.id })
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    console.log("🔍 Booking found:", {
      bookingId: booking.id,
      orderId: booking.order?.id,
      currentBookingStatus: booking.status,
      customerName: booking.user?.name,
      orderNumber: booking.order?.orderNumber,
      paymentStatus: booking.order?.paymentStatus,
    })

    if (action === "accept" && booking.order?.paymentStatus !== "SUCCEEDED") {
      console.log("❌ Cannot accept booking with unsuccessful payment:", booking.order?.paymentStatus)
      return NextResponse.json(
        {
          error: "Cannot accept booking. Payment has not been completed successfully.",
        },
        { status: 400 },
      )
    }

    // Convert action to status
    const newBookingStatus = action === "accept" ? "CONFIRMED" : "CANCELLED"
    const newOrderStatus = action === "accept" ? "CONFIRMED" : "CANCELLED"

    console.log("🔄 Converting action to status:", { action, newBookingStatus, newOrderStatus })

    // Use transaction to update both booking and order status
    const result = await prisma.$transaction(async (tx) => {
      // Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: {
          status: newBookingStatus,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
              paymentStatus: true,
              paymentIntentId: true,
            },
          },
        },
      })

      // Update corresponding order status
      if (booking.order?.id) {
        await tx.order.update({
          where: { id: booking.order.id },
          data: {
            status: newOrderStatus,
            updatedAt: new Date(),
            transferStatus: action === "accept" ? "PENDING" : "CANCELLED",
          },
        })
        console.log("✅ Order status updated:", {
          orderId: booking.order.id,
          newStatus: newOrderStatus,
          transferStatus: action === "accept" ? "PENDING" : "CANCELLED",
        })
      }

      return updatedBooking
    })

    // 🔥 CRITICAL: Handle refund for declined bookings
    if (action === "decline" && booking.order?.paymentIntentId) {
      try {
        console.log("💸 PROCESSING REFUND for declined booking...")
        console.log("   - Payment Intent ID:", booking.order.paymentIntentId)
        console.log("   - Order Number:", booking.order.orderNumber)
        console.log("   - Amount:", booking.order.totalAmount)

        // Create refund in Stripe
        const refund = await stripe.refunds.create({
          payment_intent: booking.order.paymentIntentId,
          reason: "requested_by_customer", // Celebrity declined = customer request
          metadata: {
            orderId: booking.order.id,
            orderNumber: booking.order.orderNumber,
            celebrityId: celebrity.id,
            reason: "Celebrity declined booking",
          },
        })

        console.log("✅ Refund created successfully:", refund.id)

        // Update order with refund information
        await prisma.order.update({
          where: { id: booking.order.id },
          data: {
            refundId: refund.id,
            refundStatus: "PROCESSING",
            refundAmount: refund.amount / 100, // Convert from cents to dollars
            refundedAt: new Date(),
          },
        })

        console.log("✅ Order updated with refund information")
      } catch (refundError) {
        console.error("❌ Failed to process refund:", refundError)
        // Don't fail the booking decline if refund fails - log for manual processing
        console.error("🚨 MANUAL REFUND REQUIRED for order:", booking.order.orderNumber)
      }
    }

    console.log("✅ Booking and Order status updated:", {
      bookingId: result.id,
      oldStatus: booking.status,
      newBookingStatus: result.status,
      newOrderStatus,
      action,
    })

    // Send email notifications
    try {
      if (action === "accept") {
        console.log("📧 Sending booking confirmation email to customer...")
        await sendBookingConfirmationToCustomer(result.user?.email || "", result.user?.name || "Customer", {
          orderNumber: result.order?.orderNumber || `REQ-${result.id.slice(-8)}`,
          celebrityName: celebrity.user?.name || "Celebrity",
          recipientName: booking.recipientName || "Recipient",
          occasion: booking.occasion || "General Request",
          amount: result.order?.totalAmount || 0,
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        })
      } else {
        console.log("📧 Sending booking rejection email to customer...")
        await sendBookingRejectionToCustomer(result.user?.email || "", result.user?.name || "Customer", {
          orderNumber: result.order?.orderNumber || `REQ-${result.id.slice(-8)}`,
          celebrityName: celebrity.user?.name || "Celebrity",
          recipientName: booking.recipientName || "Recipient",
          occasion: booking.occasion || "General Request",
          amount: result.order?.totalAmount || 0,
          refundAmount: result.order?.totalAmount || 0,
        })
      }
      console.log("✅ Email notification sent successfully!")
    } catch (emailError) {
      console.error("❌ Failed to send email notification:", emailError)
      // Don't fail the request if email fails
    }

    // Format response
    const formattedBooking = {
      id: result.id,
      orderNumber: result.order?.orderNumber || `REQ-${result.id.slice(-8)}`,
      customerName: result.user?.name || "Unknown Customer",
      customerEmail: result.user?.email || "",
      customerImage: result.user?.image || null,
      recipientName: booking.recipientName || "Unknown Recipient",
      occasion: booking.occasion || "General Request",
      instructions: booking.instructions || "",
      amount: result.order?.totalAmount || 0,
      requestedDate: new Date().toISOString(),
      status: result.status.toLowerCase(),
      createdAt: result.createdAt.toISOString(),
      deadline: booking.deadline?.toISOString() || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      paymentStatus: result.order?.paymentStatus || "PENDING",
    }

    console.log("📤 Updated booking response:", formattedBooking)

    return NextResponse.json({
      success: true,
      booking: formattedBooking,
      message: `Booking ${action === "accept" ? "accepted" : "declined"} successfully`,
      ...(action === "decline" && { refundProcessed: true }),
    })
  } catch (error) {
    console.error("❌ Error updating booking request:", error)
    return NextResponse.json({ error: "Failed to update booking request" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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

    // Get specific booking
    const booking = await prisma.booking.findUnique({
      where: {
        id,
        celebrityId: celebrity.id,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            email: true,
          },
        },
        order: {
          select: {
            orderNumber: true,
            totalAmount: true,
            paymentStatus: true,
            recipientName: true,
            personalMessage: true,
            specialInstructions: true,
            scheduledDate: true,
            scheduledTime: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const formattedBooking = {
      id: booking.id,
      orderNumber: booking.order?.orderNumber || "N/A",
      customerName: booking.user.name || "Anonymous",
      customerEmail: booking.user.email,
      customerImage: booking.user.image || "/placeholder.svg?height=40&width=40",
      recipientName: booking.order?.recipientName || booking.user.name,
      occasion: booking.occasion || "General",
      message: booking.message,
      personalMessage: booking.order?.personalMessage || "",
      specialInstructions: booking.order?.specialInstructions || "",
      status: booking.status,
      price: booking.price || 0,
      totalAmount: booking.order?.totalAmount || booking.price || 0,
      paymentStatus: booking.order?.paymentStatus || "PENDING",
      scheduledDate: booking.order?.scheduledDate,
      scheduledTime: booking.order?.scheduledTime,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    }

    return NextResponse.json(formattedBooking)
  } catch (error) {
    console.error("Error fetching booking request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
