import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

console.log("📦 APPROVAL API - Imports loaded successfully")

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
})

console.log("💳 APPROVAL API - Stripe initialized:", !!process.env.STRIPE_SECRET_KEY)
console.log("🗄️ APPROVAL API - Prisma available:", !!prisma)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  console.log("🚀 APPROVAL API CALLED - Starting function...")
  
  try {
    console.log("🔐 Getting server session...")
    const session = await getServerSession(authOptions)
    console.log("👤 Session result:", !!session, "User ID:", session?.user?.id)
    
    if (!session?.user?.id) {
      console.log("❌ No session or user ID")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("📝 Getting params...")
    const { orderNumber } = await params
    console.log("🔢 Order number:", orderNumber)

    if (!orderNumber) {
      console.log("❌ No order number provided")
      return NextResponse.json({ error: "Order number is required" }, { status: 400 })
    }

    console.log(`🔍 Processing approval for order: ${orderNumber}`)
    console.log(`👤 User ID: ${session.user.id}`)

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        celebrity: {
          include: {
            user: true,
          },
        },
        user: true,
      },
    })

    if (!order) {
      console.log(`❌ Order not found: ${orderNumber}`)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    console.log(`📋 Order details:`, {
      id: order.id,
      status: order.status,
      approvalStatus: order.approvalStatus,
      userId: order.userId,
      celebrityId: order.celebrityId,
      hasStripeAccount: !!order.celebrity.stripeConnectAccountId,
      totalAmount: order.totalAmount,
      currency: order.currency
    })

    if (order.userId !== session.user.id) {
      console.log(`❌ Unauthorized: User ${session.user.id} cannot approve order ${order.id} (owned by ${order.userId})`)
      return NextResponse.json({ error: "Unauthorized to approve this order" }, { status: 403 })
    }

    if (order.approvalStatus !== "PENDING_APPROVAL") {
      console.log(`❌ Invalid status: Order ${order.id} has status ${order.approvalStatus}, expected PENDING_APPROVAL`)
      return NextResponse.json(
        { error: `Order cannot be approved. Current approval status: ${order.approvalStatus}` },
        { status: 400 }
      )
    }

    // Check if celebrity has Stripe Connect account
    if (!order.celebrity.stripeConnectAccountId) {
      console.log(`❌ No Stripe account: Celebrity ${order.celebrityId} has no Stripe Connect account`)
      return NextResponse.json(
        { error: "Celebrity payment account not set up" },
        { status: 400 }
      )
    }

    console.log(`✅ Validation passed, proceeding with Stripe transfer...`)

    // Use the order's actual currency instead of hardcoded "nzd"
    const currency = order.currency.toLowerCase()
    
    // Amounts (in cents)
    const originalAmount = Math.round(order.totalAmount * 100)
    const platformFee = Math.round(originalAmount * 0.2) // 20% platform fee
    const celebrityAmount = originalAmount - platformFee

    console.log(`💰 Financial breakdown:`, {
      originalAmount: order.totalAmount,
      originalAmountCents: originalAmount,
      platformFee: platformFee / 100,
      platformFeeCents: platformFee,
      celebrityAmount: celebrityAmount / 100,
      celebrityAmountCents: celebrityAmount,
      currency
    })

    // Create a direct transfer to the celebrity's account
    // This transfers the money that was already paid by the customer
    console.log(`