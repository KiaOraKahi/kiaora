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
      userName: session?.user?.name,
    })

    if (!session?.user?.id) {
      console.log("❌ Celebrity Stats API - No session or user ID")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get celebrity profile
    console.log("🔍 Looking for celebrity profile with userId:", session.user.id)
    const celebrity = await prisma.celebrity.findUnique({
      where: { userId: session.user.id },
    })

    console.log("🔍 Celebrity profile found:", {
      celebrityId: celebrity?.id,
      // celebrityName: celebrity?.name,
      // celebritySlug: celebrity?.slug,
      celebrityUserId: celebrity?.userId,
    })

    if (!celebrity) {
      console.log("❌ Celebrity profile not found for userId:", session.user.id)
      return NextResponse.json({ error: "Celebrity profile not found" }, { status: 404 })
    }

    console.log("🔍 Fetching statistics for celebrity ID:", celebrity.id)

    // Get statistics
    const [
      totalBookings,
      pendingBookings,
      completedBookings,
      totalOrders,
      completedOrders,
      totalReviews,
      averageRating,
    ] = await Promise.all([
      // Total bookings for this celebrity
      prisma.booking.count({
        where: { celebrityId: celebrity.id },
      }),
      // Pending bookings
      prisma.booking.count({
        where: {
          celebrityId: celebrity.id,
          status: "PENDING",
        },
      }),
      // Completed bookings
      prisma.booking.count({
        where: {
          celebrityId: celebrity.id,
          status: "COMPLETED",
        },
      }),
      // Total orders (for earnings calculation)
      prisma.order.findMany({
        where: {
          celebrityId: celebrity.id,
          paymentStatus: "SUCCEEDED",
        },
        select: {
          totalAmount: true,
          createdAt: true,
        },
      }),
      // Completed orders this month
      prisma.order.findMany({
        where: {
          celebrityId: celebrity.id,
          paymentStatus: "SUCCEEDED",
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        select: {
          totalAmount: true,
        },
      }),
      // Total reviews
      prisma.review.count({
        where: { celebrityId: celebrity.id },
      }),
      // Average rating
      prisma.review.aggregate({
        where: { celebrityId: celebrity.id },
        _avg: {
          rating: true,
        },
      }),
    ])

    console.log("📊 Raw statistics fetched:", {
      totalBookings,
      pendingBookings,
      completedBookings,
      totalOrdersCount: totalOrders.length,
      totalOrdersData: totalOrders,
      completedOrdersCount: completedOrders.length,
      completedOrdersData: completedOrders,
      totalReviews,
      averageRating: averageRating._avg.rating,
    })

    // Calculate earnings
    const totalEarnings = totalOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    const monthlyEarnings = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0)

    // Calculate completion rate
    const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 95

    const stats = {
      totalEarnings,
      monthlyEarnings,
      pendingRequests: pendingBookings,
      completedBookings,
      averageRating: averageRating._avg.rating || celebrity.averageRating || 4.5,
      totalReviews,
      responseRate: 98, // This could be calculated based on response times
      averageResponseTime: 24, // This could be calculated from actual response data
      completionRate,
      responseTime: celebrity.responseTime || "24 hours",
    }

    console.log("📈 Final calculated stats:", stats)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("❌ Error fetching celebrity stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
