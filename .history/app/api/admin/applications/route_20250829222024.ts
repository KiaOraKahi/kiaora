import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const whereClause: any = {}

    // Filter by status if provided
    if (status && status !== "all") {
      whereClause.status = status.toUpperCase()
    }

    // Search functionality
    if (search) {
      whereClause.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { profession: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ]
    }

    const applications = await prisma.celebrityApplication.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    })

    // Get statistics
    const stats = await prisma.celebrityApplication.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    })

    const totalApplications = await prisma.celebrityApplication.count()

    const formattedStats = {
      total: totalApplications,
      pending: stats.find((s) => s.status === "PENDING")?._count.status || 0,
      underReview: stats.find((s) => s.status === "UNDER_REVIEW")?._count.status || 0,
      approved: stats.find((s) => s.status === "APPROVED")?._count.status || 0,
      rejected: stats.find((s) => s.status === "REJECTED")?._count.status || 0,
    }

    return NextResponse.json({
      applications,
      stats: formattedStats,
    })
  } catch (error) {
    console.error("❌ Error fetching applications:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}