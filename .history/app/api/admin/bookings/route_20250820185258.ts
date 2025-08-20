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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const paymentStatus = searchParams.get("paymentStatus")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { celebrity: { user: { name: { contains: search, mode: "insensitive" } } } },
      ]
    }

    if (status && status !== "all") {
      where.status = status
    }

    if (paymentStatus && paymentStatus !== "all") {
      where.paymentStatus = paymentStatus
    }

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          celebrity: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                }
              }
            }
          },
          booking: {
            select: {
              id: true,
              status: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    // Format orders
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email,
      },
      celebrity: {
        id: order.celebrity?.user.id,
        name: order.celebrity?.user.name,
        email: order.celebrity?.user.email,
      },
      amount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      bookingStatus: order.booking?.status || "N/A"
    }))

    return NextResponse.json({
      bookings: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { orderId, action, data } = body

    if (!orderId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let result

    switch (action) {
      case "updateStatus":
        result = await prisma.order.update({
          where: { id: orderId },
          data: { status: data.status },
        })
        break

      case "updatePaymentStatus":
        result = await prisma.order.update({
          where: { id: orderId },
          data: { 
            paymentStatus: data.paymentStatus,
            paidAt: data.paymentStatus === "SUCCEEDED" ? new Date() : null
          },
        })
        break

      case "updateBookingStatus":
        result = await prisma.booking.update({
          where: { orderId },
          data: { status: data.status },
        })
        break

      case "refundOrder":
        // Update order status to refunded
        result = await prisma.order.update({
          where: { id: orderId },
          data: { 
            status: "REFUNDED",
            paymentStatus: "REFUNDED"
          },
        })
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true, order: result })
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}