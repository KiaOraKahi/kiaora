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

    const [
      totalUsers,
      totalCelebrities,
      totalBookings,
      totalOrders,
      pendingApplications,
      activeUsers,
      completedBookings,
      totalRevenue,
      averageOrderValue,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.user.count({
        where: { role: "CELEBRITY" },
      }),

      prisma.booking.count(),
      prisma.order.count(),

      prisma.celebrityApplication.count({
        where: { status: "PENDING" },
      }),

      prisma.user.count({
        where: { emailVerified: { not: null } },
      }),

      prisma.booking.count({
        where: { status: "COMPLETED" },
      }),

      prisma.order.aggregate({
        where: {
          status: "COMPLETED",
          paymentStatus: "SUCCEEDED",
        },
        _sum: {
          totalAmount: true,
        },
      }),

      prisma.order.aggregate({
        where: {
          status: "COMPLETED",
          paymentStatus: "SUCCEEDED",
        },
        _avg: {
          totalAmount: true,
        },
      }),
    ])

    const cancelledBookings = await prisma.booking.count({
      where: { status: "CANCELLED" },
    })

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [thisMonthUsers, lastMonthUsers] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: thisMonth,
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: lastMonth,
            lt: thisMonth,
          },
        },
      }),
    ])

    const monthlyGrowth = lastMonthUsers > 0 ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0

    return NextResponse.json({
      totalUsers,
      totalCelebrities,
      totalBookings,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingApplications,
      monthlyGrowth: Math.round(monthlyGrowth * 10) / 10,
      activeUsers,
      completedBookings,
      cancelledBookings,
      averageOrderValue: Math.round((averageOrderValue._avg.totalAmount || 0) * 100) / 100,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}