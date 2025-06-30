import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "CELEBRITY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mock data - replace with actual database queries
    const stats = {
      totalEarnings: 15420,
      monthlyEarnings: 3240,
      pendingRequests: 8,
      completedBookings: 127,
      averageRating: 4.9,
      totalReviews: 89,
      responseRate: 98,
      averageResponseTime: 2.3,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching celebrity stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}