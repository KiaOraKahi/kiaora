import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculatePaymentSplit } from "@/lib/stripe"
import { sendVideoApprovalNotification } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    console.log("🎬 Celebrity Video Upload API - Starting...")

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log("❌ Celebrity Video Upload API - No session or user ID")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse JSON body instead of FormData
    const body = await request.json()
    const { bookingId, videoUrl, filename, notes } = body

    if (!bookingId || !videoUrl) {
      return NextResponse.json({ 
        error: "Missing required fields: bookingId and videoUrl" 
      }, { status: 400 })
    }

    console.log("📋 Upload Details:")
    console.log("   - Booking ID:", bookingId)
    console.log("   - Video URL:", videoUrl)
    console.log("   - Filename:", filename)
    console.log("   - Notes:", notes)

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

    console.log("✅ Celebrity found:", celebrity.user.name)

    // Find and validate the booking
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        celebrityId: celebrity.id,
      },
      include: {
        user: {
          select: {
            id: true,
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
            approvalStatus: true,
          },
        },
      },
    })

    if (!booking) {
      console.log("❌ Booking not found or not owned by celebrity:", { bookingId, celebrityId: celebrity.id })
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    console.log("✅ Booking found:", {
      bookingId: booking.id,
      orderId: booking.order?.id,
      currentStatus: booking.status,
      customerName: booking.user?.name,
      orderNumber: booking.order?.orderNumber,
      paymentStatus: booking.order?.paymentStatus,
      approvalStatus: booking.order?.approvalStatus,
    })

    // Validate booking status - must be CONFIRMED
    if (booking.status !== "CONFIRMED") {
      console.log("❌ Invalid booking status for video upload:", booking.status)
      return NextResponse.json(
        {
          error: `Cannot upload video for booking with status: ${booking.status}. Booking must be CONFIRMED.`,
        },
        { status: 400 },
      )
    }

    console.log("✅ Video already uploaded to Blob:", videoUrl)

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Get the full order details for payment split calculation (but don't transfer yet)
      const fullOrder = await tx.order.findUnique({
        where: { id: booking.order!.id },
        include: {
          user: { select: { name: true, email: true } },
          celebrity: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      })

      if (!fullOrder) {
        throw new Error("Order not found for approval workflow")
      }

      // Calculate payment splits for future use (but don't transfer yet)
      console.log("💰 CALCULATING PAYMENT SPLITS FOR APPROVAL WORKFLOW...")
      const totalAmountCents = Math.round((fullOrder.totalAmount || 0) * 100)
      const { platformFee, celebrityAmount } = calculatePaymentSplit(totalAmountCents)

      console.log("💰 PAYMENT SPLIT CALCULATION (HELD UNTIL APPROVAL):")
      console.log("   - Total Amount:", totalAmountCents, "cents")
      console.log("   - Platform Fee (20%):", platformFee, "cents")
      console.log("   - Celebrity Amount (80%):", celebrityAmount, "cents")

      // Update order with video URL and set to PENDING_APPROVAL
      const order = await tx.order.update({
        where: { id: booking.order!.id },
        data: {
          videoUrl: videoUrl,
          status: "PENDING_APPROVAL", 
          approvalStatus: "PENDING_APPROVAL",
          deliveredAt: new Date(),
          updatedAt: new Date(),
          // Store calculated payment splits for future transfer
          platformFee: platformFee / 100,
          celebrityAmount: celebrityAmount / 100,
        },
      })

      // Update booking status to IN_PROGRESS (video uploaded, awaiting approval)
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "CONFIRMED",
          updatedAt: new Date(),
        },
      })

      return { order, fullOrder, celebrityAmount, platformFee }
    })

    try {
      if (booking.user?.email && booking.order?.orderNumber) {
        console.log("📧 Sending video approval notification to customer...")
        const emailResult = await sendVideoApprovalNotification(
          booking.user.email,
          booking.user.name || "Customer",
          {
            orderNumber: booking.order.orderNumber,
            celebrityName: celebrity.user.name || "Celebrity",
            videoUrl: videoUrl,
            recipientName: booking.recipientName || "Recipient",
            occasion: booking.occasion || "General Request",
            approvalUrl: `${process.env.NEXTAUTH_URL}/orders/${booking.order.orderNumber}`,
          },
        )

        if (emailResult.success) {
          console.log("Video approval notification sent successfully!")
        } else {
          console.log("Video approval notification failed but continuing:", emailResult.error)
        }
      }
    } catch (emailError) {
      console.error("Failed to send video approval notification:", emailError)
    }

    console.log("VIDEO UPLOAD COMPLETED - AWAITING CUSTOMER APPROVAL")
    console.log("   - Video URL:", videoUrl)
    console.log("   - Booking Status: IN_PROGRESS")
    console.log("   - Order Status: PENDING_APPROVAL")
    console.log("   - Approval Status: PENDING_APPROVAL")
    console.log("   - Payment: HELD until customer approval")

    return NextResponse.json({
      success: true,
      message: "Video uploaded successfully and sent for customer approval",
      videoUrl: videoUrl,
            filename: filename,
      order: {
        id: updatedOrder.order.id,
        orderNumber: booking.order?.orderNumber,
        status: updatedOrder.order.status,
        approvalStatus: updatedOrder.order.approvalStatus,
        deliveredAt: updatedOrder.order.deliveredAt,
      },
      workflow: {
        stage: "PENDING_APPROVAL",
        message: "Customer will review the video and approve or request changes",
        paymentStatus: "HELD_UNTIL_APPROVAL",
        celebrityAmount: updatedOrder.celebrityAmount / 100, // Return in dollars
        platformFee: updatedOrder.platformFee / 100, // Return in dollars
      },
    })
  } catch (error) {
    console.error("❌ Error uploading video:", error)
    return NextResponse.json(
      {
        error: "Failed to upload video",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
