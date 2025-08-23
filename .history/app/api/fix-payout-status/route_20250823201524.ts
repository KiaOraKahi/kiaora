import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find the celebrity
    const celebrity = await prisma.celebrity.findUnique({
      where: { userId: session.user.id },
    })

    if (!celebrity) {
      return NextResponse.json({ error: "Celebrity profile not found" }, { status: 404 })
    }

    // Update all IN_TRANSIT payouts to PAID for this celebrity
    const updatedPayouts = await prisma.payout.updateMany({
      where: {
        celebrityId: celebrity.id,
        status: "IN_TRANSIT",
      },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    })

    // Update all IN_TRANSIT transfers to PAID
    const updatedTransfers = await prisma.transfer.updateMany({
      where: {
        celebrityId: celebrity.id,
        status: "IN_TRANSIT",
      },
      data: {
        status: "PAID",
        completedAt: new Date(),
      },
    })

    // Update all IN_TRANSIT orders to PAID
    const updatedOrders = await prisma.order.updateMany({
      where: {
        celebrityId: celebrity.id,
        transferStatus: "IN_TRANSIT",
      },
      data: {
        transferStatus: "PAID",
        transferredAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Payout statuses updated successfully",
      updated: {
        payouts: updatedPayouts.count,
        transfers: updatedTransfers.count,
        orders: updatedOrders.count,
      },
    })
  } catch (error: any) {
    console.error("❌ Error fixing payout status:", error)
    return NextResponse.json(
      {
        error: "Failed to fix payout status",
        details: error.message,
      },
      { status: 500 }
    )
  }
}
