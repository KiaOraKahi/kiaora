import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch payments for the authenticated user
    const payments = await prisma.payment.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        order: {
          include: {
            celebrity: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Transform the data to match the frontend interface
    const transformedPayments = payments.map((payment) => ({
      id: payment.id,
      orderNumber: payment.order.orderNumber,
      amount: payment.amount,
      status: payment.status.toLowerCase(),
      date: payment.createdAt.toISOString(),
      type: payment.type.toLowerCase() as "booking" | "tip" | "refund",
      description: `${payment.order.celebrity.user.name} - ${payment.type === "tip" ? "Tip" : "Personal Video Message"}`,
      celebrityName: payment.order.celebrity.user.name,
    }))

    return NextResponse.json(transformedPayments)
  } catch (error) {
    console.error("Error fetching user payments:", error)
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    )
  }
} 