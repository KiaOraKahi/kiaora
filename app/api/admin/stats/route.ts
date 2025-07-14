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

    // Get all stats in parallel
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
      // Total users
      prisma.user.count(),

      // Total celebrities
      prisma.user.count({
        where: { role: "CELEBRITY" },
      }),

      // Total bookings
      prisma.booking.count(),

      // Total orders
      prisma.order.count(),

      // Pending applications
      prisma.celebrityApplication.count({
        where: { status: "PENDING" },
      }),

      // Active users (users with verified email)
      prisma.user.count({
        where: { emailVerified: { not: null } },
      }),

      // Completed bookings
      prisma.booking.count({
        where: { status: "COMPLETED" },
      }),

      // Total revenue from completed orders
      prisma.order.aggregate({
        where: {
          status: "COMPLETED",
          paymentStatus: "SUCCEEDED",
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // Average order value
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

    // Calculate cancelled bookings
    const cancelledBookings = await prisma.booking.count({
      where: { status: "CANCELLED" },
    })

    // Get monthly growth (compare this month to last month)
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
      monthlyGrowth: Math.round(monthlyGrowth * 10) / 10, // Round to 1 decimal
      activeUsers,
      completedBookings,
      cancelledBookings,
      averageOrderValue: Math.round((averageOrderValue._avg.totalAmount || 0) * 100) / 100, // Round to 2 decimals
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}