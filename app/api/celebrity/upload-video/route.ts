import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { put } from "@vercel/blob"
import { calculatePaymentSplit, transferBookingPayment } from "@/lib/stripe"
import { sendVideoDeliveryNotification } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    console.log("🎬 Celebrity Video Upload API - Starting...")

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log("❌ Celebrity Video Upload API - No session or user ID")
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

    const data = await request.formData()
    const file: File | null = data.get("video") as unknown as File
    const bookingId: string = data.get("bookingId") as string

    if (!file) {
      return NextResponse.json({ error: "No video file received." }, { status: 400 })
    }

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required." }, { status: 400 })
    }

    console.log("📋 Upload Details:")
    console.log("   - Celebrity:", celebrity.user.name)
    console.log("   - Booking ID:", bookingId)
    console.log("   - File name:", file.name)
    console.log("   - File size:", file.size, "bytes")
    console.log("   - File type:", file.type)

    // Validate file size (50MB max for videos)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File size too large. Maximum 50MB allowed for videos." }, { status: 400 })
    }

    // Validate file type - only videos allowed
    const allowedVideoTypes = [
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/x-msvideo", // .avi
      "video/webm",
      "video/x-ms-wmv", // .wmv
    ]

    if (!allowedVideoTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Only video files (MP4, MOV, AVI, WebM, WMV) are allowed.",
        },
        { status: 400 },
      )
    }

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

    // Validate payment status - must be SUCCEEDED
    if (booking.order?.paymentStatus !== "SUCCEEDED") {
      console.log("❌ Payment not succeeded for booking:", booking.order?.paymentStatus)
      return NextResponse.json(
        {
          error: "Cannot upload video for unpaid booking. Payment must be completed first.",
        },
        { status: 400 },
      )
    }

    // Generate unique filename for video
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filename = `celebrity-videos/${celebrity.id}/${booking.order?.orderNumber}-${timestamp}-${sanitizedFileName}`

    console.log("📤 Uploading video to Vercel Blob...")
    // Upload video to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    console.log("✅ Video uploaded successfully:", blob.url)

    // Update order with video URL and mark as completed
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Get the full order details for transfer calculation
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
        throw new Error("Order not found for transfer calculation")
      }

      // 🔥 CRITICAL: Calculate payment splits when video is uploaded (completion)
      console.log("💰 CALCULATING PAYMENT SPLITS ON COMPLETION...")
      const totalAmountCents = Math.round((fullOrder.totalAmount || 0) * 100) // Convert to cents
      const { platformFee, celebrityAmount } = calculatePaymentSplit(totalAmountCents)

      console.log("💰 PAYMENT SPLIT CALCULATION:")
      console.log("   - Total Amount:", totalAmountCents, "cents")
      console.log("   - Platform Fee (20%):", platformFee, "cents")
      console.log("   - Celebrity Amount (80%):", celebrityAmount, "cents")

      // Update order with video and payment splits
      const order = await tx.order.update({
        where: { id: booking.order!.id },
        data: {
          videoUrl: blob.url,
          status: "COMPLETED",
          deliveredAt: new Date(),
          updatedAt: new Date(),
          // Store calculated payment splits
          platformFee: platformFee / 100, // Convert from cents to dollars
          celebrityAmount: celebrityAmount / 100, // Convert from cents to dollars
        },
      })

      // Update booking
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "COMPLETED",
          updatedAt: new Date(),
        },
      })

      return { order, fullOrder, celebrityAmount, platformFee }
    })

    // 🔥 CRITICAL: Initiate transfer to celebrity ONLY after video upload
    console.log("💸 INITIATING TRANSFER TO CELEBRITY...")
    if (celebrity.stripeConnectAccountId && celebrity.stripePayoutsEnabled && updatedOrder.order.id) {
      try {
        console.log("🔄 Initiating booking payment transfer to celebrity:", session.user?.name)
        const transferResult = await transferBookingPayment({
          accountId: celebrity.stripeConnectAccountId,
          amount: updatedOrder.celebrityAmount, // Already in cents
          currency: "usd",
          orderId: updatedOrder.order.id,
          orderNumber: booking.order?.orderNumber || `REQ-${booking.id.slice(-8)}`,
          celebrityName: session.user?.name || "Celebrity",
        })

        // Update order with transfer info
        await prisma.order.update({
          where: { id: updatedOrder.order.id },
          data: {
            transferId: transferResult.transferId,
            transferStatus: "IN_TRANSIT",
          },
        })

        // Create transfer record
        await prisma.transfer.create({
          data: {
            stripeTransferId: transferResult.transferId,
            celebrityId: celebrity.id,
            orderId: updatedOrder.order.id,
            amount: updatedOrder.celebrityAmount, // In cents
            currency: "usd",
            type: "BOOKING_PAYMENT",
            status: "IN_TRANSIT",
            description: `Payment for completed booking ${booking.order?.orderNumber}`,
          },
        })

        // Update celebrity total earnings
        await prisma.celebrity.update({
          where: { id: celebrity.id },
          data: {
            totalEarnings: {
              increment: updatedOrder.celebrityAmount / 100, // Convert to dollars
            },
          },
        })

        console.log("✅ Transfer initiated successfully:", transferResult.transferId)
      } catch (error) {
        console.error("❌ Failed to initiate transfer:", error)
        // Update transfer status to failed but don't fail the video upload
        await prisma.order.update({
          where: { id: updatedOrder.order.id },
          data: { transferStatus: "FAILED" },
        })
      }
    } else {
      console.log("⚠️ Celebrity doesn't have Connect account for transfer")
      // Update transfer status to pending
      await prisma.order.update({
        where: { id: updatedOrder.order.id },
        data: { transferStatus: "PENDING" },
      })
    }

    // Send delivery notification to customer
    try {
      if (booking.user?.email && booking.order?.orderNumber) {
        console.log("📧 Sending delivery notification to customer...")
        await sendVideoDeliveryNotification(booking.user.email, booking.user.name || "Customer", {
          orderNumber: booking.order.orderNumber,
          celebrityName: celebrity.user.name || "Celebrity",
          videoUrl: blob.url,
          recipientName: booking.recipientName || "Recipient",
          occasion: booking.occasion || "General Request",
        })
        console.log("✅ Delivery notification sent successfully!")
      }
    } catch (emailError) {
      console.error("❌ Failed to send delivery notification:", emailError)
      // Don't fail the request if email fails
    }

    console.log("✅ VIDEO UPLOAD COMPLETED SUCCESSFULLY")
    console.log("   - Video URL:", blob.url)
    console.log("   - Booking Status: COMPLETED")
    console.log("   - Order Status: COMPLETED")
    console.log("   - Transfer Status:", celebrity.stripeConnectAccountId ? "IN_TRANSIT" : "PENDING")

    return NextResponse.json({
      success: true,
      message: "Video uploaded and booking completed successfully",
      videoUrl: blob.url,
      filename: blob.pathname,
      order: {
        id: updatedOrder.order.id,
        orderNumber: booking.order?.orderNumber,
        status: updatedOrder.order.status,
        deliveredAt: updatedOrder.order.deliveredAt,
      },
      transfer: {
        status: celebrity.stripeConnectAccountId ? "IN_TRANSIT" : "PENDING",
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
