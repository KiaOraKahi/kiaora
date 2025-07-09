import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { stripe, calculatePaymentSplit } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { celebrityId, amount, bookingData, orderItems, paymentType = "booking" } = await request.json()

    console.log(`🔄 Creating ${paymentType} payment intent for celebrity:`, celebrityId)
    console.log("💰 Amount:", amount)

    // Validate required fields
    if (!celebrityId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    // Find celebrity in database
    const celebrity = await prisma.celebrity.findUnique({
      where: { id: String(celebrityId) },
      include: { user: true },
    })

    if (!celebrity) {
      console.log("❌ Celebrity not found:", celebrityId)
      return NextResponse.json({ error: "Celebrity not found" }, { status: 404 })
    }

    console.log("✅ Celebrity found in database:", celebrity.user.name)

    // Check if celebrity has Stripe Connect account for transfers
    if (!celebrity.stripeConnectAccountId) {
      console.log("⚠️ Celebrity doesn't have Stripe Connect account")
      // We'll still allow the payment but won't be able to transfer until they set up Connect
    }

    // Handle different payment types
    if (paymentType === "tip") {
      return await handleTipPayment({
        session,
        celebrity,
        amount,
        orderId: bookingData.orderId,
        orderNumber: bookingData.orderNumber,
        message: bookingData.message,
      })
    }

    // Handle booking payment (default)
    return await handleBookingPayment({
      session,
      celebrity,
      amount,
      bookingData,
      orderItems,
    })
  } catch (error) {
    console.error("❌ Payment intent creation error:", error)
    return NextResponse.json(
      { error: "Failed to create payment intent", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// Handle booking payment with 80/20 split
async function handleBookingPayment({
  session,
  celebrity,
  amount,
  bookingData,
  orderItems,
}: {
  session: any
  celebrity: any
  amount: number
  bookingData: any
  orderItems: any[]
}) {
  // Validate booking data
  if (!bookingData.recipientName || !bookingData.occasion || !bookingData.personalMessage || !bookingData.email) {
    throw new Error("Missing required booking information")
  }

  // Calculate platform fee (20%) and celebrity amount (80%)
  // Convert amount to cents for Stripe calculations
  const amountInCents = Math.round(amount * 100)
  const { platformFee, celebrityAmount } = calculatePaymentSplit(amountInCents, 20)

  console.log(`💰 Payment breakdown:`)
  console.log(`   Total: $${amount}`)
  console.log(`   Platform Fee (20%): $${platformFee / 100}`)
  console.log(`   Celebrity Amount (80%): $${celebrityAmount / 100}`)

  // Generate unique order number
  const orderNumber = `KO-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

  // Create order first (but NOT the booking - that happens after payment succeeds)
  console.log("📝 Creating order...")
  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: session.user.id,
      celebrityId: String(celebrity.id),
      totalAmount: amount,
      currency: "usd",
      status: "PENDING", // Will be updated to CONFIRMED after payment
      paymentStatus: "PENDING", // Will be updated to SUCCEEDED after payment
      // Platform fee tracking
      platformFee: platformFee / 100, // Store in dollars
      celebrityAmount: celebrityAmount / 100, // Store in dollars
      transferStatus: "PENDING",
      // Booking details
      recipientName: bookingData.recipientName,
      occasion: bookingData.occasion,
      personalMessage: bookingData.personalMessage,
      specialInstructions: bookingData.specialInstructions || null,
      messageType: bookingData.messageType || "personal",
      email: bookingData.email,
      phone: bookingData.phone || null,
      scheduledDate: bookingData.scheduledDate ? new Date(bookingData.scheduledDate) : null,
      scheduledTime: bookingData.scheduledTime || null,
    },
  })

  console.log("✅ Order created:", order.orderNumber)

  // Create order items
  console.log("📦 Creating order items...")
  for (const item of orderItems) {
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        type: item.type,
        name: item.name,
        description: item.description || null,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        metadata: item.metadata ? JSON.stringify(item.metadata) : null,
      },
    })
  }

  console.log("✅ Order items created")

  // DO NOT CREATE BOOKING HERE - it will be created in the webhook after payment succeeds
  console.log("⏳ Booking will be created after payment succeeds via webhook")

  // Create Stripe payment intent
  console.log("💳 Creating Stripe PaymentIntent...")
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents, // Already in cents
    currency: "usd",
    description: `Booking: ${celebrity.user.name} for ${bookingData.recipientName}`,
    metadata: {
      type: "booking",
      orderId: order.id,
      orderNumber: order.orderNumber,
      // No bookingId here since booking doesn't exist yet
      celebrityId: String(celebrity.id),
      celebrityName: celebrity.user.name || "Unknown",
      userId: session.user.id,
      userName: session.user.name || "Unknown",
      // Payment split info
      totalAmount: amountInCents.toString(),
      platformFee: platformFee.toString(),
      celebrityAmount: celebrityAmount.toString(),
      // Connect account info
      celebrityConnectAccountId: celebrity.stripeConnectAccountId || "",
      canTransfer: celebrity.stripeConnectAccountId ? "true" : "false",
    },
    automatic_payment_methods: {
      enabled: true,
    },
  })

  console.log("✅ Stripe PaymentIntent created:", paymentIntent.id)

  // Update order with payment intent ID
  await prisma.order.update({
    where: { id: order.id },
    data: { paymentIntentId: paymentIntent.id },
  })

  console.log("✅ Booking payment intent created successfully")
  console.log("📋 Summary:")
  console.log(`   - Order created: ${order.orderNumber}`)
  console.log(`   - Payment Intent: ${paymentIntent.id}`)
  console.log(`   - Booking will be created after payment succeeds`)

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    orderNumber: order.orderNumber,
    orderId: order.id,
    paymentType: "booking",
    platformFee: platformFee / 100,
    celebrityAmount: celebrityAmount / 100,
  })
}

// Handle tip payment (100% to celebrity)
async function handleTipPayment({
  session,
  celebrity,
  amount,
  orderId,
  orderNumber,
  message,
}: {
  session: any
  celebrity: any
  amount: number
  orderId: string
  orderNumber: string
  message?: string
}) {
  console.log("💝 Creating tip payment...")

  // Validate tip amount
  if (amount < 1 || amount > 1000) {
    throw new Error("Tip amount must be between $1 and $1000")
  }

  // Verify the order exists and belongs to this celebrity
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      celebrityId: celebrity.id,
    },
  })

  if (!order) {
    console.log("❌ Order not found or doesn't belong to celebrity")
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  // Check if order is completed (can only tip completed orders)
  if (order.status !== "COMPLETED") {
    return NextResponse.json({ error: "Can only tip completed orders" }, { status: 400 })
  }

  // Create tip record
  const tip = await prisma.tip.create({
    data: {
      orderId: orderId,
      userId: session.user.id,
      celebrityId: celebrity.id,
      amount: amount,
      currency: "usd",
      message: message || null,
      paymentStatus: "PENDING",
      transferStatus: "PENDING",
    },
  })

  console.log("✅ Tip record created:", tip.id)

  // Create Stripe payment intent for tip
  console.log("💳 Creating tip PaymentIntent...")
  const amountInCents = Math.round(amount * 100)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: "usd",
    description: `Tip for ${celebrity.user.name} - Order ${orderNumber}`,
    metadata: {
      type: "tip",
      tipId: tip.id,
      orderId: orderId,
      orderNumber: orderNumber,
      celebrityId: celebrity.id,
      celebrityName: celebrity.user.name || "Unknown",
      userId: session.user.id,
      userName: session.user.name || "Unknown",
      // Tip info (100% to celebrity)
      tipAmount: amountInCents.toString(),
      celebrityAmount: amountInCents.toString(), // 100% of tip
      // Connect account info
      celebrityConnectAccountId: celebrity.stripeConnectAccountId || "",
      canTransfer: celebrity.stripeConnectAccountId ? "true" : "false",
    },
    automatic_payment_methods: {
      enabled: true,
    },
  })

  console.log("✅ Tip PaymentIntent created:", paymentIntent.id)

  // Update tip with payment intent ID
  await prisma.tip.update({
    where: { id: tip.id },
    data: { paymentIntentId: paymentIntent.id },
  })

  console.log("✅ Tip payment intent created successfully")

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    tipId: tip.id,
    orderId: orderId,
    orderNumber: orderNumber,
    paymentType: "tip",
    tipAmount: amount,
    celebrityAmount: amount, // 100% goes to celebrity
  })
}
