import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { orderNumber: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderNumber } = params

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
        items: true,
        booking: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Format the response with safe date handling
    const formattedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status.toLowerCase(),
      paymentStatus: order.paymentStatus.toLowerCase(),
      totalAmount: order.totalAmount,
      currency: order.currency,
      createdAt: order.createdAt.toISOString(),
      paidAt: order.paidAt?.toISOString() || null,
      deliveredAt: order.deliveredAt?.toISOString() || null,

      // Booking details
      recipientName: order.recipientName,
      occasion: order.occasion,
      message: order.personalMessage,
      specialInstructions: order.specialInstructions,
      messageType: order.messageType,
      scheduledDate: order.scheduledDate?.toISOString() || null,
      scheduledTime: order.scheduledTime,
      videoUrl: order.videoUrl,

      // Contact info
      email: order.email,
      phone: order.phone,

      // Celebrity info
      celebrityName: order.celebrity.user.name || "Unknown Celebrity",
      celebrityImage: order.celebrity.user.image,
      celebrityCategory: order.celebrity.category || "Entertainment",

      // User info
      userName: order.user.name,
      userEmail: order.user.email,

      // Booking status
      bookingStatus: order.booking?.status?.toLowerCase() || "pending",

      // Items
      items: order.items.map((item) => ({
        id: item.id,
        type: item.type,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),

      // Transaction info (simplified)
      transactions: [
        {
          id: `txn_${order.id}`,
          amount: order.totalAmount,
          currency: order.currency,
          status: order.paymentStatus.toLowerCase(),
          paymentMethod: "card",
          createdAt: order.createdAt.toISOString(),
        },
      ],
    }

    return NextResponse.json({ order: formattedOrder })
  } catch (error) {
    console.error("❌ Error fetching order details:", error)
    return NextResponse.json({ error: "Failed to fetch order details" }, { status: 500 })
  }
}
