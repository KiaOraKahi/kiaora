import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ orderNumber: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderNumber } = await params

    const order = await prisma.order.findUnique({
      where: {
        orderNumber,
        userId: session.user.id, // Ensure user can only access their own orders
      },
      include: {
        celebrity: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        items: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Get the booking separately if it exists
    const booking = await prisma.booking.findFirst({
      where: {
        orderId: order.id,
      },
      select: {
        id: true,
        status: true,
      },
    })

    // Check if user has reviewed this order
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        celebrityId: order.celebrityId,
        bookingId: booking?.id,
      },
      select: {
        id: true,
      },
    })

    // Format the response to match frontend interface
    const formattedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status?.toLowerCase() || "pending",
      paymentStatus: order.paymentStatus?.toLowerCase() || "pending",
      totalAmount: order.totalAmount || 0,
      currency: order.currency || "usd",
      createdAt: order.createdAt.toISOString(),
      paidAt: order.paidAt?.toISOString() || null,
      deliveredAt: order.deliveredAt?.toISOString() || null,

      // Booking details
      recipientName: order.recipientName || "",
      occasion: order.occasion || "",
      personalMessage: order.personalMessage || "",
      specialInstructions: order.specialInstructions || null,
      messageType: order.messageType?.toLowerCase() || "video",
      scheduledDate: order.scheduledDate?.toISOString() || null,
      scheduledTime: order.scheduledTime || null,
      videoUrl: order.videoUrl || null,

      // Contact info
      email: order.email || "",
      phone: order.phone || null,

      // Celebrity info - get name and image from the linked user
      celebrity: {
        id: order.celebrity?.id || "",
        name: order.celebrity?.user?.name || "Unknown Celebrity",
        image: order.celebrity?.user?.image || null,
        category: order.celebrity?.category || "Entertainment",
        verified: order.celebrity?.verified || false,
      },

      // User info
      user: {
        id: order.user?.id || "",
        name: order.user?.name || "",
        email: order.user?.email || "",
        image: order.user?.image || null,
      },

      // Booking info
      booking: booking
        ? {
            id: booking.id,
            status: booking.status?.toLowerCase() || "pending",
          }
        : null,

      // Review status
      hasReviewed: !!existingReview,

      // Items
      items: (order.items || []).map((item: any) => ({
        id: item.id,
        type: item.type || "video",
        name: item.name || "Video Message",
        description: item.description || "",
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        totalPrice: item.totalPrice || 0,
      })),

      // Transaction info (simplified)
      transactions: [
        {
          id: `txn_${order.id}`,
          amount: order.totalAmount || 0,
          currency: order.currency || "usd",
          status: order.paymentStatus?.toLowerCase() || "pending",
          paymentMethod: "card",
          createdAt: order.createdAt.toISOString(),
        },
      ],
    }

    return NextResponse.json(formattedOrder)
  } catch (error) {
    console.error("❌ Error fetching order details:", error)
    return NextResponse.json({ error: "Failed to fetch order details" }, { status: 500 })
  }
}
