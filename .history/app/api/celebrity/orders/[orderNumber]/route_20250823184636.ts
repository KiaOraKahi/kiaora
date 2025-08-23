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

    // Check if user is a celebrity
    if (session.user.role !== "CELEBRITY") {
      return NextResponse.json({ error: "Only celebrities can access this endpoint" }, { status: 403 })
    }

    const { orderNumber } = await params

    // Find order where the celebrity is involved
    const order = await prisma.order.findUnique({
      where: {
        orderNumber,
        celebrityId: session.user.id, // Celebrity can only access their own orders
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
        tips: {
          where: {
            orderId: { not: null }, // Only get tips for this order
          },
          select: {
            id: true,
            amount: true,
            message: true,
            paymentStatus: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
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
        deadline: true,
        price: true,
      },
    })

    // Calculate total tips amount
    const totalTipsAmount = order.tips.reduce((sum, tip) => {
      return tip.paymentStatus === "SUCCEEDED" ? sum + tip.amount : sum
    }, 0)

    // Format the response for celebrity view
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
      approvalStatus: order.approvalStatus?.toLowerCase() || "pending",
      approvedAt: order.approvedAt?.toISOString() || null,
      declinedAt: order.declinedAt?.toISOString() || null,
      declineReason: order.declineReason || null,
      revisionCount: order.revisionCount || 0,

      // Booking details
      recipientName: order.recipientName || "",
      occasion: order.occasion || "",
      personalMessage: order.personalMessage || "",
      specialInstructions: order.specialInstructions || null,
      messageType: order.messageType?.toLowerCase() || "video",
      scheduledDate: order.scheduledDate?.toISOString() || null,
      scheduledTime: order.scheduledTime || null,
      videoUrl: order.videoUrl || null,

      // Customer info (celebrity view)
      customer: {
        id: order.user?.id || "",
        name: order.user?.name || "",
        email: order.user?.email || "",
        image: order.user?.image || null,
      },

      // Celebrity info
      celebrity: {
        id: order.celebrity?.id || "",
        name: order.celebrity?.user?.name || "Unknown Celebrity",
        image: order.celebrity?.user?.image || null,
        category: order.celebrity?.category || "Entertainment",
        verified: order.celebrity?.verified || false,
      },

      // Booking info
      booking: booking
        ? {
            id: booking.id,
            status: booking.status?.toLowerCase() || "pending",
            deadline: booking.deadline?.toISOString() || null,
            price: booking.price || 0,
          }
        : null,

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

      // Tips data
      tips: order.tips.map((tip) => ({
        id: tip.id,
        amount: tip.amount,
        message: tip.message,
        status: tip.paymentStatus?.toLowerCase() || "pending",
        createdAt: tip.createdAt.toISOString(),
      })),
      totalTips: totalTipsAmount,

      // Financial info for celebrity
      celebrityAmount: order.celebrityAmount || 0,
      platformFee: order.platformFee || 0,
      transferStatus: order.transferStatus || "PENDING",
    }

    return NextResponse.json(formattedOrder)
  } catch (error) {
    console.error("❌ Error fetching celebrity order details:", error)
    return NextResponse.json({ error: "Failed to fetch order details" }, { status: 500 })
  }
}
