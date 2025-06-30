import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

// Mock celebrity data that matches the frontend
const mockCelebrityData = {
  "1": {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    price: 299,
  },
  "2": {
    id: "2",
    name: "Marcus Thompson",
    email: "marcus@example.com",
    price: 199,
  },
}

async function ensureMockCelebrityExists(celebrityId: string) {
  const mockData = mockCelebrityData[celebrityId as keyof typeof mockCelebrityData]
  if (!mockData) return null

  try {
    // Check if celebrity already exists
    let celebrity = await prisma.celebrity.findUnique({
      where: { id: celebrityId },
      include: { user: true },
    })

    if (celebrity) {
      return {
        id: celebrity.id,
        name: celebrity.user.name,
        email: celebrity.user.email,
        price: celebrity.price,
      }
    }

    // Create mock user first
    const user = await prisma.user.create({
      data: {
        id: `user_${celebrityId}`,
        name: mockData.name,
        email: mockData.email,
        role: "CELEBRITY",
        isVerified: true,
      },
    })

    // Create mock celebrity
    celebrity = await prisma.celebrity.create({
      data: {
        id: celebrityId,
        userId: user.id,
        price: mockData.price,
        category: "Entertainment",
        bio: `Professional celebrity - ${mockData.name}`,
        isActive: true,
      },
      include: { user: true },
    })

    console.log("✅ Created mock celebrity:", celebrity.user.name)

    return {
      id: celebrity.id,
      name: celebrity.user.name,
      email: celebrity.user.email,
      price: celebrity.price,
    }
  } catch (error) {
    console.error("❌ Error creating mock celebrity:", error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { celebrityId, amount, bookingData, orderItems } = await request.json()

    console.log("🔄 Creating payment intent for celebrity:", celebrityId)
    console.log("💰 Amount:", amount)

    // Ensure celebrityId is a string
    const celebrityIdString = String(celebrityId)

    // First try to get celebrity from database, or create mock celebrity
    let celebrityData = null
    try {
      const celebrity = await prisma.celebrity.findUnique({
        where: { id: celebrityIdString },
        include: { user: true },
      })

      if (celebrity) {
        celebrityData = {
          id: celebrity.id,
          name: celebrity.user.name,
          email: celebrity.user.email,
          price: celebrity.price,
        }
        console.log("✅ Celebrity found in database:", celebrityData.name)
      } else {
        // Try to create mock celebrity
        celebrityData = await ensureMockCelebrityExists(celebrityIdString)
        if (celebrityData) {
          console.log("✅ Using/created mock celebrity data:", celebrityData.name)
        }
      }
    } catch (dbError) {
      console.log("⚠️ Database lookup failed:", dbError)
      // Try to create mock celebrity as fallback
      celebrityData = await ensureMockCelebrityExists(celebrityIdString)
    }

    if (!celebrityData) {
      console.log("❌ Celebrity not found with ID:", celebrityIdString)
      return NextResponse.json({ error: "Celebrity not found" }, { status: 404 })
    }

    // Generate unique order number
    const orderNumber = `KO-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    // Create order first
    console.log("📝 Creating order...")
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        celebrityId: celebrityIdString, // Ensure this is a string
        totalAmount: amount,
        currency: "usd",
        status: "PENDING",
        paymentStatus: "PENDING",

        // Booking details
        recipientName: bookingData.recipientName,
        occasion: bookingData.occasion,
        personalMessage: bookingData.personalMessage,
        specialInstructions: bookingData.specialInstructions || null,
        messageType: bookingData.messageType || "personal",

        // Contact info
        email: bookingData.email,
        phone: bookingData.phone || null,

        // Scheduling
        scheduledDate: bookingData.scheduledDate ? new Date(bookingData.scheduledDate) : null,
        scheduledTime: bookingData.scheduledTime || null,
      },
    })

    console.log("✅ Order created:", order.id)

    // Create order items
    if (orderItems && orderItems.length > 0) {
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
            metadata: item.metadata || null,
          },
        })
      }
      console.log("✅ Order items created")
    }

    // Create booking linked to order
    console.log("🎬 Creating booking...")
    const booking = await prisma.booking.create({
      data: {
        orderId: order.id,
        userId: session.user.id,
        celebrityId: celebrityIdString, // Ensure this is a string
        message: bookingData.personalMessage,
        occasion: bookingData.occasion,
        status: "PENDING",
        price: amount,
      },
    })

    console.log("✅ Booking created:", booking.id)

    // Create Stripe PaymentIntent
    console.log("💳 Creating Stripe PaymentIntent...")
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        bookingId: booking.id,
        celebrityId: celebrityIdString,
        userId: session.user.id,
        celebrityName: celebrityData.name,
        recipientName: bookingData.recipientName,
      },
    })

    console.log("✅ Stripe PaymentIntent created:", paymentIntent.id)

    // Update order with payment intent ID
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentIntentId: paymentIntent.id },
    })

    console.log("✅ Order updated with payment intent ID")

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderNumber: order.orderNumber,
      orderId: order.id,
    })
  } catch (error) {
    console.error("❌ Payment intent creation error:", error)
    return NextResponse.json(
      {
        error: "Failed to create payment intent",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
