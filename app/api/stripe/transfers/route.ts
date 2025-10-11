import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId, amount, celebrityId } = await request.json()

    // Verify the order exists and is completed
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        celebrity: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!order || order.status !== "COMPLETED") {
      return NextResponse.json({ error: "Order not found or not completed" }, { status: 404 })
    }

    // Get celebrity's Stripe account
    const celebrity = await prisma.celebrity.findUnique({
      where: { id: celebrityId },
    })

    if (!celebrity?.stripeAccountId) {
      return NextResponse.json({ error: "Celebrity Stripe account not found" }, { status: 404 })
    }

    // Calculate platform fee (10%)
    const platformFee = Math.round(amount * 0.1)
    const celebrityAmount = amount - platformFee

    // Create transfer to celebrity
    const transfer = await stripe.transfers.create({
      amount: celebrityAmount,
      currency: "nzd",
      destination: celebrity.stripeAccountId,
      metadata: {
        orderId: order.id,
        celebrityId: celebrity.id,
        platformFee: platformFee.toString(),
      },
    })

    // Record the payout in database
    await prisma.payout.create({
      data: {
        celebrityId: celebrity.id,
        orderId: order.id,
        amount: celebrityAmount,
        platformFee,
        stripeTransferId: transfer.id,
        status: "COMPLETED",
        paidAt: new Date(),
      },
    })

    // Update order payout status
    await prisma.order.update({
      where: { id: orderId },
      data: { payoutStatus: "COMPLETED" },
    })

    return NextResponse.json({
      success: true,
      transferId: transfer.id,
      amount: celebrityAmount,
      platformFee,
    })
  } catch (error) {
    console.error("❌ Error creating transfer:", error)
    return NextResponse.json({ error: "Failed to create transfer" }, { status: 500 })
  }
}

// Get transfer status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const transferId = searchParams.get("transferId")

    if (!transferId) {
      return NextResponse.json({ error: "Transfer ID required" }, { status: 400 })
    }

    const transfer = await stripe.transfers.retrieve(transferId)

    return NextResponse.json({
      id: transfer.id,
      amount: transfer.amount,
      currency: transfer.currency,
      status: transfer.object,
      created: transfer.created,
      destination: transfer.destination,
    })
  } catch (error) {
    console.error("❌ Error fetching transfer:", error)
    return NextResponse.json({ error: "Failed to fetch transfer" }, { status: 500 })
  }
}