import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { celebrity: { user: { name: { contains: search, mode: "insensitive" } } } },
        { recipientName: { contains: search, mode: "insensitive" } },
      ]
    }

    if (status !== "all") {
      where.status = status
    }

    // Get bookings with related data
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          celebrity: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
              paymentStatus: true,
              tips: true,
            },
          },
          reviews: {
            select: {
              id: true,
              rating: true,
              comment: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ])

    // Format bookings for response
    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      orderNumber: booking.orderNumber,
      customerName: booking.user.name,
      customerEmail: booking.user.email,
      celebrityName: booking.celebrity.user.name,
      celebrityEmail: booking.celebrity.user.email,
      message: booking.message,
      recipientName: booking.recipientName,
      occasion: booking.occasion,
      price: booking.price,
      totalAmount: booking.totalAmount,
      status: booking.status,
      paymentStatus: booking.order?.paymentStatus || "PENDING",
      createdAt: booking.createdAt,
      scheduledDate: booking.scheduledDate,
      deadline: booking.deadline,
      tips: booking.order?.tips?.reduce((sum, tip) => sum + tip.amount, 0) || 0,
      reviews: booking.reviews,
    }))

    return NextResponse.json({
      bookings: formattedBookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}