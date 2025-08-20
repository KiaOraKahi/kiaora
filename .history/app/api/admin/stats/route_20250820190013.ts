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

    // Get current date and last month date
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

    // Get statistics
    const [
      totalUsers,
      totalCelebrities,
      totalOrders,
      totalRevenue,
      lastMonthUsers,
      lastMonthCelebrities,
      lastMonthOrders,
      lastMonthRevenue,
      recentUsers,
      recentBookings
    ] = await Promise.all([
      // Total counts
             prisma.user.count({ where: { role: "FAN" } }),
      prisma.celebrity.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { paymentStatus: "SUCCEEDED" },
        _sum: { totalAmount: true }
      }),
      
      // Last month counts
      prisma.user.count({ 
        where: { 
          role: "USER",
          createdAt: { gte: lastMonth }
        } 
      }),
      prisma.celebrity.count({ 
        where: { 
          isActive: true,
          createdAt: { gte: lastMonth }
        } 
      }),
      prisma.order.count({ 
        where: { 
          createdAt: { gte: lastMonth }
        } 
      }),
      prisma.order.aggregate({
        where: { 
          paymentStatus: "SUCCEEDED",
          createdAt: { gte: lastMonth }
        },
        _sum: { totalAmount: true }
      }),
      
      // Recent data
      prisma.user.findMany({
        where: { role: "USER" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { name: true } },
          celebrity: { 
            include: { user: { select: { name: true } } }
          }
        }
      })
    ])

    // Calculate growth percentages
    const userGrowth = lastMonthUsers > 0 ? ((totalUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0
    const celebrityGrowth = lastMonthCelebrities > 0 ? ((totalCelebrities - lastMonthCelebrities) / lastMonthCelebrities) * 100 : 0
    const orderGrowth = lastMonthOrders > 0 ? ((totalOrders - lastMonthOrders) / lastMonthOrders) * 100 : 0
    
    const currentRevenue = totalRevenue._sum.totalAmount || 0
    const lastMonthRevenueSum = lastMonthRevenue._sum.totalAmount || 0
    const revenueGrowth = lastMonthRevenueSum > 0 ? ((currentRevenue - lastMonthRevenueSum) / lastMonthRevenueSum) * 100 : 0

    // Format recent data
    const formattedRecentUsers = recentUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      joined: formatTimeAgo(user.createdAt)
    }))

    const formattedRecentBookings = recentBookings.map(booking => ({
      id: booking.id,
      customer: booking.user?.name || "Unknown",
      celebrity: booking.celebrity?.user?.name || "Unknown",
      amount: booking.totalAmount,
      status: booking.status,
      date: formatTimeAgo(booking.createdAt)
    }))

    return NextResponse.json({
      stats: {
        totalUsers,
        totalCelebrities,
        totalOrders,
        totalRevenue: currentRevenue,
        userGrowth: Math.round(userGrowth * 100) / 100,
        celebrityGrowth: Math.round(celebrityGrowth * 100) / 100,
        orderGrowth: Math.round(orderGrowth * 100) / 100,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100
      },
      recentUsers: formattedRecentUsers,
      recentBookings: formattedRecentBookings
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return `${Math.floor(diffInSeconds / 2592000)} months ago`
}