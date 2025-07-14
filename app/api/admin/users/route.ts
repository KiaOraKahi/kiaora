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
    const role = searchParams.get("role") || "all"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    if (role !== "all") {
      where.role = role
    }

    // Get users with their related data
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
              bookings: true,
            },
          },
          orders: {
            where: {
              status: "COMPLETED",
              paymentStatus: "SUCCEEDED",
            },
            select: {
              totalAmount: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    // Transform users data
    const transformedUsers = users.map((user) => ({
      id: user.id,
      name: user.name || "Unknown",
      email: user.email,
      role: user.role,
      emailVerified: !!user.emailVerified,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      totalBookings: user._count.bookings,
      totalOrders: user._count.orders,
      totalSpent: user.orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0),
    }))

    // Get stats
    const [totalUsers, verifiedUsers, celebrities, fans, admins] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          OR: [{ emailVerified: { not: null } }, { isVerified: true }],
        },
      }),
      prisma.user.count({ where: { role: "CELEBRITY" } }),
      prisma.user.count({ where: { role: "FAN" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
    ])

    const stats = {
      totalUsers,
      verifiedUsers,
      unverifiedUsers: totalUsers - verifiedUsers,
      celebrities,
      fans,
      admins,
    }

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      users: transformedUsers,
      stats,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: totalPages,
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}