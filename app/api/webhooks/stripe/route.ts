import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import type Stripe from "stripe"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")

    if (!signature) {
      console.log("❌ No Stripe signature found")
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err) {
      console.log("❌ Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    console.log("🎣 Webhook received:", event.type)

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log("✅ Payment succeeded:", paymentIntent.id)

      try {
        // Find and update the order
        const order = await prisma.order.findUnique({
          where: { paymentIntentId: paymentIntent.id },
          include: { booking: true },
        })

        if (order) {
          // Update order status
          await prisma.order.update({
            where: { paymentIntentId: paymentIntent.id },
            data: {
              paymentStatus: "SUCCEEDED",
              status: "CONFIRMED",
              paidAt: new Date(),
            },
          })

          // Update booking status if exists
          if (order.booking) {
            await prisma.booking.update({
              where: { id: order.booking.id },
              data: { status: "ACCEPTED" },
            })
          }

          console.log("✅ Order and booking updated successfully")
        } else {
          console.log("⚠️ Order not found for payment intent:", paymentIntent.id)
        }
      } catch (error) {
        console.error("❌ Error updating order:", error)
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log("❌ Payment failed:", paymentIntent.id)

      try {
        // Update order status to failed
        await prisma.order.update({
          where: { paymentIntentId: paymentIntent.id },
          data: {
            paymentStatus: "FAILED",
            status: "CANCELLED",
          },
        })

        console.log("✅ Order marked as failed")
      } catch (error) {
        console.error("❌ Error updating failed order:", error)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("❌ Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
