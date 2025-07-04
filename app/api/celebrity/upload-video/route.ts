import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { put } from "@vercel/blob"
import { sendVideoDeliveryNotification } from "@/lib/email"

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

    // Verify booking ownership
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        celebrityId: celebrity.id,
        status: "CONFIRMED",
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            recipientName: true,
            occasion: true,
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
          error: "Booking not found or not confirmed",
        },
        { status: 404 },
      )
    }

    console.log("📹 Uploading video for booking:", {
      bookingId,
      orderId: booking.order?.id,
      orderNumber: booking.order?.orderNumber,
      fileSize: file.size,
      fileType: file.type,
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

    // Update order with video URL and mark as completed
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order
      const order = await tx.order.update({
        where: { id: booking.order!.id },
        data: {
          videoUrl: blob.url,
          status: "COMPLETED",
          deliveredAt: new Date(),
          updatedAt: new Date(),
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
    })

    // Send email notification to customer about video delivery
    try {
      console.log("📧 Sending video delivery notification to customer...")
      await sendVideoDeliveryNotification(booking.user?.email || "", booking.user?.name || "Customer", {
        orderNumber: booking.order?.orderNumber || `REQ-${booking.id.slice(-8)}`,
        celebrityName: session.user?.name || "Celebrity",
        recipientName: booking.order?.recipientName || "Recipient",
        occasion: booking.order?.occasion || "General Request",
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
      },
    })
  } catch (error) {
    console.error("❌ Video upload error:", error)
    return NextResponse.json({ error: "Failed to upload video" }, { status: 500 })
  }
}