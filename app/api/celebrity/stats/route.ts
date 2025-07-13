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

    // 🔥 NEW: Only count COMPLETED orders for actual earnings
    const completedOrderEarnings = await prisma.order.aggregate({
      where: {
        celebrityId: celebrity.id,
        paymentStatus: "SUCCEEDED",
        status: "COMPLETED", // 🔥 Only completed orders count as earned
      },
      _sum: {
        celebrityAmount: true,
      },
    })

    // 🔥 NEW: Monthly completed earnings
    const monthlyCompletedEarnings = await prisma.order.aggregate({
      where: {
        celebrityId: celebrity.id,
        paymentStatus: "SUCCEEDED",
        status: "COMPLETED",
        createdAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        celebrityAmount: true,
      },
    })

    // 🔥 NEW: Calculate pending earnings (confirmed but not completed)
    const pendingEarnings = await prisma.order.aggregate({
      where: {
        celebrityId: celebrity.id,
        paymentStatus: "SUCCEEDED",
        status: "CONFIRMED", // 🔥 Money held by platform for confirmed bookings
      },
      _sum: {
        celebrityAmount: true,
      },
    })

    // 🔥 NEW: Monthly pending earnings
    const monthlyPendingEarnings = await prisma.order.aggregate({
      where: {
        celebrityId: celebrity.id,
        paymentStatus: "SUCCEEDED",
        status: "CONFIRMED",
        createdAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        celebrityAmount: true,
      },
    })

    // Tips remain the same - they transfer immediately upon payment
    const tipEarnings = await prisma.tip.aggregate({
      where: {
        celebrityId: celebrity.id,
        paymentStatus: "SUCCEEDED",
      },
      _sum: {
        amount: true,
      },
    })

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

    // Calculate earnings breakdown
    const completedOrderAmount = completedOrderEarnings._sum.celebrityAmount || 0
    const pendingOrderAmount = pendingEarnings._sum.celebrityAmount || 0
    const totalTipEarnings = tipEarnings._sum.amount || 0

    const monthlyCompleted = monthlyCompletedEarnings._sum.celebrityAmount || 0
    const monthlyPending = monthlyPendingEarnings._sum.celebrityAmount || 0
    const monthlyTips = monthlyTipEarnings._sum.amount || 0

    // Get booking statistics
    const [pendingRequests, confirmedBookings, completedBookings, totalBookings] = await Promise.all([
      prisma.booking.count({
        where: {
          celebrityId: celebrity.id,
          status: "PENDING",
        },
      }),
      prisma.booking.count({
        where: {
          celebrityId: celebrity.id,
          status: "CONFIRMED",
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
      totalBookings > 0
        ? Math.round(((completedBookings + confirmedBookings + pendingRequests) / totalBookings) * 100)
        : 95
    const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 95

    const stats = {
      // 🔥 NEW: Proper earnings breakdown
      totalEarnings: completedOrderAmount + totalTipEarnings, // Only completed + tips
      completedEarnings: completedOrderAmount, // Money already transferred
      pendingEarnings: pendingOrderAmount, // Money held by platform (confirmed but not delivered)
      tipEarnings: totalTipEarnings, // Tips (transferred immediately)

      // Monthly breakdown
      monthlyEarnings: monthlyCompleted + monthlyTips,
      monthlyCompletedEarnings: monthlyCompleted,
      monthlyPendingEarnings: monthlyPending,
      monthlyTipEarnings: monthlyTips,

      // Legacy fields for backward compatibility
      orderEarnings: completedOrderAmount,
      monthlyOrderEarnings: monthlyCompleted,

      // Booking statistics
      pendingRequests, // New requests waiting for acceptance
      confirmedBookings, // Accepted but not delivered (money held by platform)
      completedBookings, // Delivered (money transferred)
      totalBookings,

      // Performance metrics
      averageRating: reviewStats._avg.rating || 4.5,
      totalReviews: reviewStats._count.id || 0,
      responseRate,
      completionRate,
      averageResponseTime: 24, // hours
    }

    console.log("📊 Celebrity Stats:", {
      ...stats,
      calculation: {
        completedOrderAmount,
        pendingOrderAmount,
        totalTipEarnings,
        monthlyCompleted,
        monthlyPending,
        monthlyTips,
        note: "Only COMPLETED orders count as earned. CONFIRMED orders are pending (money held by platform).",
      },
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error("❌ Error fetching celebrity stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
