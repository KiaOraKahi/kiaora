import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { celebrityId, amount, bookingData, orderItems } = await request.json()

    console.log("🔄 Creating payment intent for celebrity:", celebrityId)
    console.log("💰 Amount:", amount)

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

    // Generate unique order number
    const orderNumber = `KO-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    // Create order first
    console.log("📝 Creating order...")
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        celebrityId: String(celebrityId), // This should match the celebrity.id
        totalAmount: amount,
        currency: "usd",
        status: "PENDING",
        paymentStatus: "PENDING",
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
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          metadata: item.metadata || null,
        },
      })
    }

    console.log("✅ Order items created")

    // Create booking linked to order
    console.log("🎬 Creating booking...")
    const booking = await prisma.booking.create({
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: session.user.id,
        celebrityId: String(celebrityId), // This should match the celebrity.id
        message: bookingData.personalMessage,
        recipientName: bookingData.recipientName,
        occasion: bookingData.occasion,
        instructions: bookingData.specialInstructions || null,
        specialInstructions: bookingData.specialInstructions || null,
        status: "PENDING",
        price: amount,
        totalAmount: amount,
        scheduledDate: bookingData.scheduledDate ? new Date(bookingData.scheduledDate) : null,
        deadline: bookingData.deadline
          ? new Date(bookingData.deadline)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    })

    console.log("✅ Booking created:", booking.id)

    // Create Stripe payment intent
    console.log("💳 Creating Stripe PaymentIntent...")
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        bookingId: booking.id,
        celebrityId: String(celebrityId),
        userId: session.user.id,
      },
    })

    console.log("✅ Stripe PaymentIntent created:", paymentIntent.id)

    // Update order with payment intent ID
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentIntentId: paymentIntent.id },
    })

    console.log("✅ Payment intent created successfully")

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderNumber: order.orderNumber,
      orderId: order.id,
    })
  } catch (error) {
    console.error("❌ Payment intent creation error:", error)
    return NextResponse.json(
      { error: "Failed to create payment intent", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}