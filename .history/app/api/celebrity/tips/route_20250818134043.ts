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

    // Get all tips for this celebrity
    const tips = await prisma.tip.findMany({
      where: { celebrityId: celebrity.id },
      include: {
        order: {
          select: {
            orderNumber: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Calculate summary
    const totalTips = tips.reduce((sum, tip) => sum + tip.amount, 0)
    const pendingTips = tips
      .filter((tip) => tip.paymentStatus === "PENDING")
      .reduce((sum, tip) => sum + tip.amount, 0)
    const completedTips = tips
      .filter((tip) => tip.paymentStatus === "SUCCEEDED")
      .reduce((sum, tip) => sum + tip.amount, 0)
    const averageTip = tips.length > 0 ? totalTips / tips.length : 0

    const response = {
      tips: tips.map((tip) => ({
        id: tip.id,
        amount: tip.amount,
        message: tip.message,
        status: tip.paymentStatus === "SUCCEEDED" ? "PAID" : tip.paymentStatus,
        createdAt: tip.createdAt.toISOString(),
        orderNumber: tip.order.orderNumber,
      })),
      summary: {
        totalTips,
        pendingTips,
        completedTips,
        averageTip,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Error fetching tips:", error)
    return NextResponse.json({ error: "Failed to fetch tips" }, { status: 500 })
  }
}
