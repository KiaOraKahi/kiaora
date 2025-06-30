import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      userId: session.user.id,
    }

    if (status && status !== "all") {
      where.status = status.toUpperCase()
    }

    // Get orders with pagination
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
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
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    // Format the response with safe date handling
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status.toLowerCase(),
      paymentStatus: order.paymentStatus.toLowerCase(),
      totalAmount: order.totalAmount,
      currency: order.currency,
      createdAt: order.createdAt.toISOString(),
      paidAt: order.paidAt?.toISOString() || null,
      deliveredAt: order.deliveredAt?.toISOString() || null,

      // Basic booking info
      recipientName: order.recipientName,
      occasion: order.occasion,
      messageType: order.messageType,
      scheduledDate: order.scheduledDate?.toISOString() || null,
      scheduledTime: order.scheduledTime,
      videoUrl: order.videoUrl,

      // Celebrity info
      celebrityName: order.celebrity.user.name || "Unknown Celebrity",
      celebrityImage: order.celebrity.user.image,
      celebrityCategory: order.celebrity.category || "Entertainment",

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
    }))

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}