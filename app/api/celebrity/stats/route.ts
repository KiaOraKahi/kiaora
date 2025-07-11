import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    console.log("🔍 Celebrity Stats API - Session:", {
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.role,
    })

    if (!session?.user?.id) {
      console.log("❌ Celebrity Stats API - No session or user ID")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get celebrity profile
    const celebrity = await prisma.celebrity.findUnique({
      where: { userId: session.user.id },
    })

    if (!celebrity) {
      console.log("❌ Celebrity profile not found for userId:", session.user.id)
      return NextResponse.json({ error: "Celebrity profile not found" }, { status: 404 })
    }

    console.log("✅ Celebrity found:", celebrity.id)

    // Get current date for monthly calculations
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get total earnings from orders with SUCCEEDED payment status
    // We include all payment-successful orders regardless of completion status for earnings
    const orderEarnings = await prisma.order.aggregate({
      where: {
        celebrityId: celebrity.id,
        paymentStatus: "SUCCEEDED", // Only count paid orders
      },
      _sum: {
        celebrityAmount: true,
      },
    })

    // Get monthly earnings from orders
    const monthlyOrderEarnings = await prisma.order.aggregate({
      where: {
        celebrityId: celebrity.id,
        paymentStatus: "SUCCEEDED",
        createdAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        celebrityAmount: true,
      },
    })

    // Get total tips - only from orders with SUCCEEDED payment status
    // Tips are stored in the database as dollars (not cents), so no conversion needed
    const tipEarnings = await prisma.tip.aggregate({
      where: {
        celebrityId: celebrity.id,
        paymentStatus: "SUCCEEDED",
      },
      _sum: {
        amount: true,
      },
    })

    // Get monthly tips
    const monthlyTipEarnings = await prisma.tip.aggregate({
      where: {
        celebrityId: celebrity.id,
        paymentStatus: "SUCCEEDED",
        createdAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    })

    // Tips are already in dollars in the database, so no conversion needed
    const totalTipEarnings = tipEarnings._sum.amount || 0
    const monthlyTips = monthlyTipEarnings._sum.amount || 0

    // Calculate total earnings (order earnings + tips)
    const totalOrderEarnings = orderEarnings._sum.celebrityAmount || 0
    const monthlyOrders = monthlyOrderEarnings._sum.celebrityAmount || 0

    // Get booking statistics - these are for workflow tracking, not earnings
    const [pendingRequests, completedBookings, totalBookings] = await Promise.all([
      prisma.booking.count({
        where: {
          celebrityId: celebrity.id,
          status: "PENDING",
        },
      }),
      prisma.booking.count({
        where: {
          celebrityId: celebrity.id,
          status: "COMPLETED",
        },
      }),
      prisma.booking.count({
        where: {
          celebrityId: celebrity.id,
        },
      }),
    ])

    // Get review statistics
    const reviewStats = await prisma.review.aggregate({
      where: {
        celebrityId: celebrity.id,
      },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    })

    // Calculate response rate and completion rate
    const responseRate =
      totalBookings > 0 ? Math.round(((completedBookings + pendingRequests) / totalBookings) * 100) : 95
    const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 95

    const stats = {
      // Earnings breakdown - based on SUCCEEDED payments only
      totalEarnings: totalOrderEarnings + totalTipEarnings,
      orderEarnings: totalOrderEarnings,
      tipEarnings: totalTipEarnings,
      monthlyEarnings: monthlyOrders + monthlyTips,
      monthlyOrderEarnings: monthlyOrders,
      monthlyTipEarnings: monthlyTips,

      // Booking statistics - for workflow tracking
      pendingRequests,
      completedBookings,
      totalBookings,

      // Performance metrics
      averageRating: reviewStats._avg.rating || 4.5,
      totalReviews: reviewStats._count.id || 0,
      responseRate,
      completionRate,
      averageResponseTime: 24, // hours - could be calculated from actual data
    }

    console.log("📊 Celebrity Stats:", {
      ...stats,
      calculation: {
        totalOrderEarnings,
        totalTipEarnings,
        monthlyOrders,
        monthlyTips,
        note: "Earnings based on SUCCEEDED payments only, regardless of order completion status",
      },
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error("❌ Error fetching celebrity stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}