import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

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

    // Get current date for monthly calculations
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // 🔥 CRITICAL CHANGE: Only count COMPLETED orders as actual earnings
    // Get total earnings from COMPLETED orders only
    const completedOrderEarnings = await prisma.order.aggregate({
      where: {
        celebrityId: celebrity.id,
        paymentStatus: "SUCCEEDED",
        status: "COMPLETED", // 🔥 Only completed orders count as earnings
      },
      _sum: {
        celebrityAmount: true,
      },
    })

    // Get monthly earnings from COMPLETED orders
    const monthlyCompletedOrderEarnings = await prisma.order.aggregate({
      where: {
        celebrityId: celebrity.id,
        paymentStatus: "SUCCEEDED",
        status: "COMPLETED", // 🔥 Only completed orders
        createdAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        celebrityAmount: true,
      },
    })

    // 🔥 NEW: Calculate pending earnings (confirmed but not delivered)
    const pendingOrderEarnings = await prisma.order.aggregate({
      where: {
        celebrityId: celebrity.id,
        paymentStatus: "SUCCEEDED",
        status: "CONFIRMED", // 🔥 Confirmed but not completed yet
      },
      _sum: {
        celebrityAmount: true,
      },
    })

    // Get monthly pending earnings
    const monthlyPendingOrderEarnings = await prisma.order.aggregate({
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

    // Get total tips - only from COMPLETED orders
    const tipEarnings = await prisma.tip.aggregate({
      where: {
        celebrityId: celebrity.id,
        paymentStatus: "SUCCEEDED",
        order: {
          status: "COMPLETED", // 🔥 Only tips from completed orders
        },
      },
      _sum: {
        amount: true,
      },
    })

    // Get monthly tips from COMPLETED orders
    const monthlyTipEarnings = await prisma.tip.aggregate({
      where: {
        celebrityId: celebrity.id,
        paymentStatus: "SUCCEEDED",
        order: {
          status: "COMPLETED",
        },
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
    const pendingOrderAmount = pendingOrderEarnings._sum.celebrityAmount || 0
    const totalTipEarnings = tipEarnings._sum.amount || 0

    const monthlyCompleted = monthlyCompletedOrderEarnings._sum.celebrityAmount || 0
    const monthlyPending = monthlyPendingOrderEarnings._sum.celebrityAmount || 0
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

    // 🔥 NEW: Get approval workflow statistics
    const [pendingApprovalCount, approvedThisMonth, declinedThisMonth, revisionRequestedCount] = await Promise.all([
      // Orders awaiting customer approval
      prisma.order.count({
        where: {
          celebrityId: celebrity.id,
          approvalStatus: "PENDING_APPROVAL",
          status: "CONFIRMED", // Video uploaded, awaiting approval
        },
      }),
      // Orders approved this month
      prisma.order.count({
        where: {
          celebrityId: celebrity.id,
          approvalStatus: "APPROVED",
          approvedAt: {
            gte: startOfMonth,
          },
        },
      }),
      // Orders declined this month
      prisma.order.count({
        where: {
          celebrityId: celebrity.id,
          approvalStatus: "DECLINED",
          declinedAt: {
            gte: startOfMonth,
          },
        },
      }),
      // Orders needing revision
      prisma.order.count({
        where: {
          celebrityId: celebrity.id,
          approvalStatus: "REVISION_REQUESTED",
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
      // 🔥 UPDATED: Earnings breakdown - only COMPLETED orders count as actual earnings
      totalEarnings: completedOrderAmount + totalTipEarnings, // Only completed
      orderEarnings: completedOrderAmount, // Only completed
      tipEarnings: totalTipEarnings, // Only from completed orders

      // 🔥 NEW: Pending earnings - money for confirmed but not delivered bookings
      pendingEarnings: pendingOrderAmount, // Confirmed but not completed

      // Monthly breakdown
      monthlyEarnings: monthlyCompleted + monthlyTips, // Only completed
      monthlyOrderEarnings: monthlyCompleted, // Only completed
      monthlyTipEarnings: monthlyTips, // Only from completed
      monthlyPendingEarnings: monthlyPending, // Confirmed but not completed this month

      // Booking statistics
      pendingRequests, // Waiting for celebrity acceptance
      confirmedBookings, // Accepted but not delivered
      completedBookings, // Delivered
      totalBookings,

      // Approval workflow statistics
      pendingApprovalCount, // Videos awaiting customer approval
      approvedThisMonth, // Monthly approved videos
      declinedThisMonth, // Monthly declined videos
      revisionRequestedCount, // Videos needing revision

      // Approval rate calculation
      approvalRate:
        totalBookings > 0 ? Math.round((completedBookings / (completedBookings + declinedThisMonth || 1)) * 100) : 95,

      // Performance metrics
      averageRating: reviewStats._avg.rating || 4.5,
      totalReviews: reviewStats._count.id || 0,
      responseRate,
      completionRate,
      averageResponseTime: 24, // hours - could be calculated from actual data
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("❌ Error fetching celebrity stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
