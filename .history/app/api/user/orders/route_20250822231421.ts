import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch orders for the authenticated user
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        celebrity: {
          include: {
            user: true,
          },
        },
        services: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Transform the data to match the frontend interface
    const transformedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status.toLowerCase(),
      paymentStatus: order.paymentStatus.toLowerCase(),
      totalAmount: order.totalAmount,
      createdAt: order.createdAt.toISOString(),
      recipientName: order.recipientName || "N/A",
      occasion: order.occasion || "N/A",
      scheduledDate: order.scheduledDate?.toISOString() || new Date().toISOString(),
      scheduledTime: order.scheduledTime || "N/A",
      bookingStatus: order.status.toLowerCase(),
      celebrityName: order.celebrity.user.name,
      celebrityImage: order.celebrity.profileImage || "/celeb1.jpg",
      celebrityCategory: order.celebrity.category || "Celebrity",
      approvalStatus: order.approvalStatus?.toLowerCase(),
      videoUrl: order.videoUrl,
      tipAmount: order.tipAmount,
    }))

    return NextResponse.json(transformedOrders)
  } catch (error) {
    console.error("Error fetching user orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
} 