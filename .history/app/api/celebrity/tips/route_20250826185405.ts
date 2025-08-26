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

    // Get celebrity profile
    const celebrity = await prisma.celebrity.findUnique({
      where: { userId: session.user.id },
    })

    if (!celebrity) {
      return NextResponse.json({ error: "Celebrity profile not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "30d"
    const status = searchParams.get("status") || "all"
    const exportData = searchParams.get("export") === "true"

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case "7d":
        startDate.setDate(now.getDate() - 7)
        break
      case "30d":
        startDate.setDate(now.getDate() - 30)
        break
      case "90d":
        startDate.setDate(now.getDate() - 90)
        break
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Build where clause for tips
    const whereClause: any = {
      celebrityId: celebrity.id,
      createdAt: {
        gte: startDate,
      },
    }

    // Add status filter
    if (status !== "all") {
      whereClause.paymentStatus = status.toUpperCase()
    }

    // Get tips
    const tips = await prisma.tip.findMany({
      where: whereClause,
      include: {
        order: {
          select: {
            orderNumber: true,
            recipientName: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: exportData ? undefined : 50, // No limit for export
    })

    // Calculate summary statistics
    const totalTips = await prisma.tip.aggregate({
      where: { celebrityId: celebrity.id },
      _sum: { amount: true },
    })

    const pendingTips = await prisma.tip.aggregate({
      where: {
        celebrityId: celebrity.id,
        paymentStatus: "PENDING",
      },
      _sum: { amount: true },
    })

    const completedTips = await prisma.tip.aggregate({
      where: {
        celebrityId: celebrity.id,
        paymentStatus: "SUCCEEDED",
      },
      _sum: { amount: true },
    })

    const averageTip = await prisma.tip.aggregate({
      where: {
        celebrityId: celebrity.id,
        paymentStatus: "SUCCEEDED",
      },
      _avg: { amount: true },
    })

    // Format response
    const response = {
      tips: tips.map((tip) => ({
        id: tip.id,
        amount: tip.amount,
        message: tip.message,
        status: tip.paymentStatus,
        createdAt: tip.createdAt.toISOString(),
        orderNumber: tip.order.orderNumber,
        customerName: tip.user.name || "Anonymous",
        customerEmail: tip.user.email,
      })),
      summary: {
        totalTips: totalTips._sum.amount || 0,
        pendingTips: pendingTips._sum.amount || 0,
        completedTips: completedTips._sum.amount || 0,
        averageTip: averageTip._avg.amount || 0,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Error fetching celebrity tips:", error)
    return NextResponse.json({ error: "Failed to fetch tips" }, { status: 500 })
  }
}
