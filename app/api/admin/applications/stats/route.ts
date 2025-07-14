import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current date and first day of current month
    const now = new Date()
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Get application statistics
    const [total, pending, approved, rejected, thisMonth, lastMonth] = await Promise.all([
      prisma.celebrityApplication.count(),
      prisma.celebrityApplication.count({ where: { status: "PENDING" } }),
      prisma.celebrityApplication.count({ where: { status: "APPROVED" } }),
      prisma.celebrityApplication.count({ where: { status: "REJECTED" } }),
      prisma.celebrityApplication.count({
        where: {
          createdAt: {
            gte: firstDayThisMonth,
          },
        },
      }),
      prisma.celebrityApplication.count({
        where: {
          createdAt: {
            gte: firstDayLastMonth,
            lte: lastDayLastMonth,
          },
        },
      }),
    ])

    return NextResponse.json({
      total,
      pending,
      approved,
      rejected,
      thisMonth,
      lastMonth,
    })
  } catch (error) {
    console.error("Error fetching application stats:", error)
    return NextResponse.json({ error: "Failed to fetch application stats" }, { status: 500 })
  }
}