import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { stripe, formatAmountForStripe } from "@/lib/stripe"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { celebrityId, amount, currency = "usd", bookingData, orderItems } = body

    // Validate required fields
    if (!celebrityId || !amount || !bookingData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get celebrity details
    const celebrity = await sql`
      SELECT u.name, u.email, c.price 
      FROM "Celebrity" c
      JOIN "User" u ON c."userId" = u.id
      WHERE c.id = ${celebrityId}
    `

    if (celebrity.length === 0) {
      return NextResponse.json({ error: "Celebrity not found" }, { status: 404 })
    }

    // Create booking record
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    await sql`
      INSERT INTO "Booking" (
        id, "userId", "celebrityId", message, occasion, 
        "recipientName", "specialInstructions", 
        "scheduledDate", "scheduledTime", price, status
      ) VALUES (
        ${bookingId},
        ${session.user.id},
        ${celebrityId},
        ${bookingData.personalMessage},
        ${bookingData.occasion},
        ${bookingData.recipientName},
        ${bookingData.specialInstructions || null},
        ${bookingData.scheduledDate},
        ${bookingData.scheduledTime},
        ${amount},
        'pending'
      )
    `

    // Create order record
    const orderNumber = `KO-${Date.now()}`
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    await sql`
      INSERT INTO "Order" (
        id, "bookingId", "orderNumber", status, 
        "totalAmount", currency, "paymentStatus"
      ) VALUES (
        ${orderId},
        ${bookingId},
        ${orderNumber},
        'pending',
        ${amount},
        ${currency},
        'pending'
      )
    `

    // Create order items
    if (orderItems && orderItems.length > 0) {
      for (const item of orderItems) {
        const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        await sql`
          INSERT INTO "OrderItem" (
            id, "orderId", type, name, description,
            quantity, "unitPrice", "totalPrice", metadata
          ) VALUES (
            ${itemId},
            ${orderId},
            ${item.type},
            ${item.name},
            ${item.description || null},
            ${item.quantity || 1},
            ${item.unitPrice},
            ${item.totalPrice},
            ${JSON.stringify(item.metadata || {})}
          )
        `
      }
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(amount),
      currency,
      metadata: {
        bookingId,
        orderId,
        orderNumber,
        celebrityId,
        userId: session.user.id,
        celebrityName: celebrity[0].name,
        recipientName: bookingData.recipientName,
      },
    })

    // Update booking with Stripe payment intent ID
    await sql`
      UPDATE "Booking" 
      SET "stripePaymentIntentId" = ${paymentIntent.id}
      WHERE id = ${bookingId}
    `

    // Create payment transaction record
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await sql`
      INSERT INTO "PaymentTransaction" (
        id, "orderId", "stripePaymentIntentId", 
        amount, currency, status, metadata
      ) VALUES (
        ${transactionId},
        ${orderId},
        ${paymentIntent.id},
        ${amount},
        ${currency},
        'pending',
        ${JSON.stringify({ orderNumber, celebrityName: celebrity[0].name })}
      )
    `

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      bookingId,
      orderId,
      orderNumber,
    })
  } catch (error) {
    console.error("Payment intent creation error:", error)
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}
