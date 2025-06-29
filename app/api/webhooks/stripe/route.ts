import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { neon } from "@neondatabase/serverless"
import { sendEmail } from "@/lib/email"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object
        const { bookingId, orderId, orderNumber } = paymentIntent.metadata

        // Update booking status
        await sql`
          UPDATE "Booking" 
          SET status = 'accepted'
          WHERE id = ${bookingId}
        `

        // Update order status
        await sql`
          UPDATE "Order" 
          SET status = 'confirmed', "paymentStatus" = 'paid'
          WHERE id = ${orderId}
        `

        // Update payment transaction
        await sql`
          UPDATE "PaymentTransaction" 
          SET status = 'completed'
          WHERE "stripePaymentIntentId" = ${paymentIntent.id}
        `

        // Get booking details for email
        const bookingDetails = await sql`
          SELECT 
            b.*,
            u.name as "userName",
            u.email as "userEmail",
            cu.name as "celebrityName",
            cu.email as "celebrityEmail"
          FROM "Booking" b
          JOIN "User" u ON b."userId" = u.id
          JOIN "Celebrity" c ON b."celebrityId" = c.id
          JOIN "User" cu ON c."userId" = cu.id
          WHERE b.id = ${bookingId}
        `

        if (bookingDetails.length > 0) {
          const booking = bookingDetails[0]

          // Send confirmation email to customer
          await sendEmail({
            to: booking.userEmail,
            subject: `Booking Confirmed - ${orderNumber}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                  <h1 style="color: white; margin: 0;">Booking Confirmed! 🎉</h1>
                </div>
                
                <div style="padding: 30px; background: #f8f9fa;">
                  <h2 style="color: #333;">Hi ${booking.userName}!</h2>
                  <p style="color: #666; font-size: 16px;">
                    Great news! Your booking with <strong>${booking.celebrityName}</strong> has been confirmed and payment received.
                  </p>
                  
                  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Booking Details</h3>
                    <p><strong>Order Number:</strong> ${orderNumber}</p>
                    <p><strong>Celebrity:</strong> ${booking.celebrityName}</p>
                    <p><strong>Recipient:</strong> ${booking.recipientName}</p>
                    <p><strong>Occasion:</strong> ${booking.occasion}</p>
                    <p><strong>Scheduled:</strong> ${new Date(booking.scheduledDate).toLocaleDateString()} at ${booking.scheduledTime}</p>
                    <p><strong>Amount Paid:</strong> $${booking.price}</p>
                  </div>
                  
                  <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="color: #1976d2; margin-top: 0;">What's Next?</h4>
                    <ul style="color: #666;">
                      <li>${booking.celebrityName} will be notified of your request</li>
                      <li>You'll receive updates on your order progress</li>
                      <li>Your personalized video will be delivered within 7 days</li>
                      <li>You can track your order status in your dashboard</li>
                    </ul>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXTAUTH_URL}/orders/${orderNumber}" 
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                              color: white; padding: 12px 30px; text-decoration: none; 
                              border-radius: 6px; display: inline-block;">
                      Track Your Order
                    </a>
                  </div>
                </div>
                
                <div style="background: #333; color: white; padding: 20px; text-align: center;">
                  <p style="margin: 0;">Thank you for choosing Kia Ora! 🌟</p>
                </div>
              </div>
            `,
          })

          // Send notification to celebrity
          await sendEmail({
            to: booking.celebrityEmail,
            subject: `New Booking Request - ${orderNumber}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                  <h1 style="color: white; margin: 0;">New Booking Request! 🎬</h1>
                </div>
                
                <div style="padding: 30px; background: #f8f9fa;">
                  <h2 style="color: #333;">Hi ${booking.celebrityName}!</h2>
                  <p style="color: #666; font-size: 16px;">
                    You have a new confirmed booking request. Payment has been received.
                  </p>
                  
                  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Booking Details</h3>
                    <p><strong>Order Number:</strong> ${orderNumber}</p>
                    <p><strong>Customer:</strong> ${booking.userName}</p>
                    <p><strong>Recipient:</strong> ${booking.recipientName}</p>
                    <p><strong>Occasion:</strong> ${booking.occasion}</p>
                    <p><strong>Scheduled:</strong> ${new Date(booking.scheduledDate).toLocaleDateString()} at ${booking.scheduledTime}</p>
                    <p><strong>Amount:</strong> $${booking.price}</p>
                  </div>
                  
                  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="color: #333; margin-top: 0;">Message Request</h4>
                    <p style="color: #666; font-style: italic;">"${booking.message}"</p>
                    ${
                      booking.specialInstructions
                        ? `
                      <h5 style="color: #333;">Special Instructions:</h5>
                      <p style="color: #666; font-style: italic;">"${booking.specialInstructions}"</p>
                    `
                        : ""
                    }
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXTAUTH_URL}/celebrity/dashboard" 
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                              color: white; padding: 12px 30px; text-decoration: none; 
                              border-radius: 6px; display: inline-block;">
                      View in Dashboard
                    </a>
                  </div>
                </div>
                
                <div style="background: #333; color: white; padding: 20px; text-align: center;">
                  <p style="margin: 0;">Please deliver within 7 days. Thank you! 🌟</p>
                </div>
              </div>
            `,
          })
        }

        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object
        const { bookingId, orderId } = paymentIntent.metadata

        // Update booking status
        await sql`
          UPDATE "Booking" 
          SET status = 'cancelled'
          WHERE id = ${bookingId}
        `

        // Update order status
        await sql`
          UPDATE "Order" 
          SET status = 'failed', "paymentStatus" = 'failed'
          WHERE id = ${orderId}
        `

        // Update payment transaction
        await sql`
          UPDATE "PaymentTransaction" 
          SET status = 'failed'
          WHERE "stripePaymentIntentId" = ${paymentIntent.id}
        `

        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 })
  }
}
