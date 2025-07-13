import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { put } from "@vercel/blob"
import { sendVideoDeliveryNotification } from "@/lib/email"
import { transferBookingPayment, calculatePaymentSplit } from "@/lib/stripe"

export async function POST(request: NextRequest) {
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

    const data = await request.formData()
    const file: File | null = data.get("video") as unknown as File
    const bookingId: string = data.get("bookingId") as string

    if (!file) {
      return NextResponse.json({ error: "No video file received." }, { status: 400 })
    }

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required." }, { status: 400 })
    }

    // Validate file size (50MB max for videos)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File size too large. Maximum 50MB allowed." }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["video/mp4", "video/mov", "video/avi", "video/quicktime", "video/webm"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Only MP4, MOV, AVI, QuickTime, and WebM videos are allowed.",
        },
        { status: 400 },
      )
    }

    // Verify booking ownership and status
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        celebrityId: celebrity.id,
        status: "CONFIRMED", // Only confirmed bookings can have videos uploaded
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            recipientName: true,
            occasion: true,
            totalAmount: true,
            paymentStatus: true,
            paymentIntentId: true,
            status: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        {
          error: "Booking not found, not confirmed, or not owned by you",
        },
        { status: 404 },
      )
    }

    // 🔥 CRITICAL: Verify payment has succeeded before allowing video upload
    if (booking.order?.paymentStatus !== "SUCCEEDED") {
      return NextResponse.json(
        {
          error: "Cannot upload video - payment has not been processed successfully",
        },
        { status: 400 },
      )
    }

    console.log("📹 Uploading video for booking:", {
      bookingId,
      orderId: booking.order?.id,
      orderNumber: booking.order?.orderNumber,
      fileSize: file.size,
      fileType: file.type,
      totalAmount: booking.order?.totalAmount,
      currentOrderStatus: booking.order?.status,
    })

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filename = `celebrity-videos/${booking.order?.orderNumber || bookingId}-${timestamp}-${sanitizedFileName}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      handleUploadUrl: "/api/celebrity/upload-video",
    })

    console.log("✅ Video uploaded to Vercel Blob:", blob.url)

    // 🔥 CRITICAL: Calculate payment split NOW (when order is completed)
    const totalAmountInCents = Math.round((booking.order?.totalAmount || 0) * 100)
    const { platformFee, celebrityAmount } = calculatePaymentSplit(totalAmountInCents)

    console.log("💰 CALCULATING PAYMENT SPLIT ON COMPLETION:")
    console.log("   - Total Amount:", totalAmountInCents, "cents")
    console.log("   - Platform Fee (20%):", platformFee, "cents")
    console.log("   - Celebrity Amount (80%):", celebrityAmount, "cents")

    // Update order with video URL, mark as completed, and store payment split
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order - THIS IS WHERE PAYMENT SPLIT HAPPENS
      const order = await tx.order.update({
        where: { id: booking.order!.id },
        data: {
          videoUrl: blob.url,
          status: "COMPLETED", // Order is now completed
          deliveredAt: new Date(),
          updatedAt: new Date(),
          // 🔥 CRITICAL: Store payment split when order is completed
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

      return order
    })

    console.log("✅ Order and booking updated with video:", {
      orderId: updatedOrder.id,
      videoUrl: blob.url,
      status: updatedOrder.status,
      platformFee: updatedOrder.platformFee,
      celebrityAmount: updatedOrder.celebrityAmount,
    })

    // 🔥 CRITICAL: Initiate transfer to celebrity NOW (after completion)
    let transferResult = null
    if (celebrity.stripeConnectAccountId && celebrity.stripePayoutsEnabled) {
      try {
        console.log("💸 INITIATING TRANSFER TO CELEBRITY...")
        transferResult = await transferBookingPayment({
          accountId: celebrity.stripeConnectAccountId,
          amount: totalAmountInCents,
          currency: "usd",
          orderId: booking.order!.id,
          orderNumber: booking.order!.orderNumber,
          celebrityName: session.user?.name || "Celebrity",
        })

        // Update order with transfer info
        await prisma.order.update({
          where: { id: booking.order!.id },
          data: {
            transferStatus: "IN_TRANSIT",
            transferId: transferResult.transferId,
          },
        })

        // Create transfer record
        await prisma.transfer.create({
          data: {
            stripeTransferId: transferResult.transferId,
            celebrityId: celebrity.id,
            orderId: booking.order!.id,
            amount: celebrityAmount,
            currency: "usd",
            type: "BOOKING_PAYMENT",
            status: "IN_TRANSIT",
            description: `Booking payment for order ${booking.order!.orderNumber}`,
          },
        })

        console.log("✅ Transfer initiated successfully:", {
          transferId: transferResult.transferId,
          celebrityAmount: celebrityAmount / 100,
          platformFee: platformFee / 100,
        })
      } catch (transferError) {
        console.error("❌ Failed to initiate transfer:", transferError)
        // Update transfer status to failed but don't fail the video upload
        await prisma.order.update({
          where: { id: booking.order!.id },
          data: { transferStatus: "FAILED" },
        })
      }
    } else {
      console.log("⚠️ Celebrity doesn't have Connect account for transfer")
      await prisma.order.update({
        where: { id: booking.order!.id },
        data: { transferStatus: "PENDING" },
      })
    }

    // Send email notification to customer about video delivery
    try {
      console.log("📧 Sending video delivery notification to customer...")
      await sendVideoDeliveryNotification(booking.user?.email || "", booking.user?.name || "Customer", {
        orderNumber: booking.order?.orderNumber || `REQ-${booking.id.slice(-8)}`,
        celebrityName: session.user?.name || "Celebrity",
        recipientName: booking.order?.recipientName || "Recipient",
        occasion: booking.order?.occasion || "your request",
        videoUrl: blob.url,
      })
      console.log("✅ Video delivery notification sent successfully!")
    } catch (emailError) {
      console.error("❌ Failed to send video delivery notification:", emailError)
    }

    return NextResponse.json({
      success: true,
      message: "Video uploaded successfully",
      videoUrl: blob.url,
      filename: blob.pathname,
      order: {
        id: updatedOrder.id,
        orderNumber: booking.order?.orderNumber,
        status: updatedOrder.status,
        deliveredAt: updatedOrder.deliveredAt,
        platformFee: updatedOrder.platformFee,
        celebrityAmount: updatedOrder.celebrityAmount,
      },
      transfer: transferResult
        ? {
            transferId: transferResult.transferId,
            status: "initiated",
            celebrityAmount: celebrityAmount / 100,
          }
        : {
            status: "pending_connect_account",
            message: "Transfer will be processed once Connect account is set up",
          },
    })
  } catch (error) {
    console.error("❌ Video upload error:", error)
    return NextResponse.json({ error: "Failed to upload video" }, { status: 500 })
  }
}
