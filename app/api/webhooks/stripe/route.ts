import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe, transferBookingPayment, transferTipPayment, calculatePaymentSplit } from "@/lib/stripe"
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

    // Handle regular booking payments
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log("✅ Payment succeeded:", paymentIntent.id)

      try {
        // Check if this is a tip payment
        if (paymentIntent.metadata?.type === "tip") {
          await handleTipPaymentSuccess(paymentIntent)
        } else {
          // Handle regular booking payment
          await handleBookingPaymentSuccess(paymentIntent)
        }
      } catch (error) {
        console.error("❌ Error processing payment success:", error)
      }
    }

    // Handle payment failures
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log("❌ Payment failed:", paymentIntent.id)

      try {
        if (paymentIntent.metadata?.type === "tip") {
          await handleTipPaymentFailure(paymentIntent)
        } else {
          await handleBookingPaymentFailure(paymentIntent)
        }
      } catch (error) {
        console.error("❌ Error updating failed payment:", error)
      }
    }

    // Handle Connect account updates
    if (event.type === "account.updated") {
      const account = event.data.object as Stripe.Account
      console.log("🔄 Connect account updated:", account.id)

      try {
        await handleConnectAccountUpdate(account)
      } catch (error) {
        console.error("❌ Error updating Connect account:", error)
      }
    }

    // Handle transfer events
    if (event.type === "transfer.created") {
      const transfer = event.data.object as Stripe.Transfer
      console.log("🔄 Transfer created:", transfer.id)

      try {
        await handleTransferCreated(transfer)
      } catch (error) {
        console.error("❌ Error handling transfer created:", error)
      }
    }

    if (event.type === "transfer.paid") {
      const transfer = event.data.object as Stripe.Transfer
      console.log("✅ Transfer completed:", transfer.id)

      try {
        await handleTransferCompleted(transfer)
      } catch (error) {
        console.error("❌ Error handling transfer completion:", error)
      }
    }

    if (event.type === "transfer.failed") {
      const transfer = event.data.object as Stripe.Transfer
      console.log("❌ Transfer failed:", transfer.id)

      try {
        await handleTransferFailed(transfer)
      } catch (error) {
        console.error("❌ Error handling transfer failure:", error)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("❌ Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

// ==========================================
// BOOKING PAYMENT HANDLERS
// ==========================================

async function handleBookingPaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log("🔄 Processing booking payment success:", paymentIntent.id)

  // Find and update the order
  const order = await prisma.order.findUnique({
    where: { paymentIntentId: paymentIntent.id },
    include: {
      booking: true,
      celebrity: {
        include: { user: true },
      },
    },
  })

  if (!order) {
    console.log("⚠️ Order not found for payment intent:", paymentIntent.id)
    return
  }

  // Calculate payment split (80/20)
  const { platformFee, celebrityAmount } = calculatePaymentSplit(paymentIntent.amount)

  // Update order with payment and split info
  await prisma.order.update({
    where: { paymentIntentId: paymentIntent.id },
    data: {
      paymentStatus: "SUCCEEDED",
      status: "CONFIRMED",
      paidAt: new Date(),
      platformFee,
      celebrityAmount,
    },
  })

  // Update booking status if exists
  if (order.booking) {
    await prisma.booking.update({
      where: { id: order.booking.id },
      data: { status: "ACCEPTED" },
    })
  }

  // Initiate transfer to celebrity if they have Connect account
  if (order.celebrity.stripeConnectAccountId && order.celebrity.stripePayoutsEnabled) {
    try {
      console.log("🔄 Initiating transfer to celebrity:", order.celebrity.user.name)

      const transferResult = await transferBookingPayment({
        accountId: order.celebrity.stripeConnectAccountId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        orderId: order.id,
        orderNumber: order.orderNumber,
        celebrityName: order.celebrity.user.name || "Celebrity",
      })

      // Update order with transfer info
      await prisma.order.update({
        where: { id: order.id },
        data: {
          transferId: transferResult.transferId,
          transferStatus: "IN_TRANSIT",
        },
      })

      // Create transfer record
      await prisma.transfer.create({
        data: {
          stripeTransferId: transferResult.transferId,
          celebrityId: order.celebrityId,
          orderId: order.id,
          amount: transferResult.celebrityAmount,
          currency: paymentIntent.currency,
          type: "BOOKING_PAYMENT",
          status: "IN_TRANSIT",
          description: `Booking payment for order ${order.orderNumber}`,
        },
      })

      console.log("✅ Transfer initiated successfully")
    } catch (error) {
      console.error("❌ Failed to initiate transfer:", error)

      // Update transfer status to failed
      await prisma.order.update({
        where: { id: order.id },
        data: { transferStatus: "FAILED" },
      })
    }
  } else {
    console.log("⚠️ Celebrity doesn't have Connect account or payouts not enabled")

    // Update transfer status to pending (manual payout needed)
    await prisma.order.update({
      where: { id: order.id },
      data: { transferStatus: "PENDING" },
    })
  }

  console.log("✅ Booking payment processed successfully")
}

async function handleBookingPaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  console.log("🔄 Processing booking payment failure:", paymentIntent.id)

  // Update order status to failed
  await prisma.order.update({
    where: { paymentIntentId: paymentIntent.id },
    data: {
      paymentStatus: "FAILED",
      status: "CANCELLED",
      transferStatus: "FAILED",
    },
  })

  console.log("✅ Booking payment failure processed")
}

// ==========================================
// TIP PAYMENT HANDLERS
// ==========================================

async function handleTipPaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log("🔄 Processing tip payment success:", paymentIntent.id)

  // Find and update the tip
  const tip = await prisma.tip.findUnique({
    where: { paymentIntentId: paymentIntent.id },
    include: {
      celebrity: {
        include: { user: true },
      },
      order: true,
      user: true,
    },
  })

  if (!tip) {
    console.log("⚠️ Tip not found for payment intent:", paymentIntent.id)
    return
  }

  // Update tip status
  await prisma.tip.update({
    where: { paymentIntentId: paymentIntent.id },
    data: {
      paymentStatus: "SUCCEEDED",
      paidAt: new Date(),
    },
  })

  // Initiate transfer to celebrity (100% of tip)
  if (tip.celebrity.stripeConnectAccountId && tip.celebrity.stripePayoutsEnabled) {
    try {
      console.log("🔄 Initiating tip transfer to celebrity:", tip.celebrity.user.name)

      const transferResult = await transferTipPayment({
        accountId: tip.celebrity.stripeConnectAccountId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        tipId: tip.id,
        orderId: tip.orderId,
        orderNumber: tip.order.orderNumber,
        celebrityName: tip.celebrity.user.name || "Celebrity",
        customerName: tip.user.name || "Customer",
      })

      // Update tip with transfer info
      await prisma.tip.update({
        where: { id: tip.id },
        data: {
          transferId: transferResult.transferId,
          transferStatus: "IN_TRANSIT",
        },
      })

      // Create transfer record
      await prisma.transfer.create({
        data: {
          stripeTransferId: transferResult.transferId,
          celebrityId: tip.celebrityId,
          tipId: tip.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          type: "TIP",
          status: "IN_TRANSIT",
          description: `Tip from ${tip.user.name} for order ${tip.order.orderNumber}`,
        },
      })

      // Update celebrity total tips
      await prisma.celebrity.update({
        where: { id: tip.celebrityId },
        data: {
          totalTips: {
            increment: paymentIntent.amount / 100, // Convert from cents
          },
        },
      })

      console.log("✅ Tip transfer initiated successfully")
    } catch (error) {
      console.error("❌ Failed to initiate tip transfer:", error)

      // Update transfer status to failed
      await prisma.tip.update({
        where: { id: tip.id },
        data: { transferStatus: "FAILED" },
      })
    }
  } else {
    console.log("⚠️ Celebrity doesn't have Connect account for tip transfer")

    // Update transfer status to pending
    await prisma.tip.update({
      where: { id: tip.id },
      data: { transferStatus: "PENDING" },
    })
  }

  console.log("✅ Tip payment processed successfully")
}

async function handleTipPaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  console.log("🔄 Processing tip payment failure:", paymentIntent.id)

  // Update tip status to failed
  await prisma.tip.update({
    where: { paymentIntentId: paymentIntent.id },
    data: {
      paymentStatus: "FAILED",
      transferStatus: "FAILED",
    },
  })

  console.log("✅ Tip payment failure processed")
}

// ==========================================
// CONNECT ACCOUNT HANDLERS
// ==========================================

async function handleConnectAccountUpdate(account: Stripe.Account) {
  console.log("🔄 Processing Connect account update:", account.id)

  // Find celebrity with this Connect account
  const celebrity = await prisma.celebrity.findUnique({
    where: { stripeConnectAccountId: account.id },
    include: { user: true },
  })

  if (!celebrity) {
    console.log("⚠️ Celebrity not found for Connect account:", account.id)
    return
  }

  // Determine account status
  let accountStatus: "NOT_STARTED" | "PENDING" | "RESTRICTED" | "ENABLED" | "REJECTED" = "PENDING"

  if (account.details_submitted && account.charges_enabled && account.payouts_enabled) {
    accountStatus = "ENABLED"
  } else if (account.requirements?.disabled_reason) {
    accountStatus = "REJECTED"
  } else if (account.requirements?.currently_due && account.requirements.currently_due.length > 0) {
    accountStatus = "RESTRICTED"
  }

  // Update celebrity record
  await prisma.celebrity.update({
    where: { id: celebrity.id },
    data: {
      stripeAccountStatus: accountStatus,
      stripeOnboardingComplete: account.details_submitted || false,
      stripeChargesEnabled: account.charges_enabled || false,
      stripePayoutsEnabled: account.payouts_enabled || false,
      preferredCurrency: account.default_currency || "usd",
      bankCountry: account.country || null,
    },
  })

  console.log(`✅ Celebrity ${celebrity.user.name} Connect status updated to: ${accountStatus}`)
}

// ==========================================
// TRANSFER HANDLERS
// ==========================================

async function handleTransferCreated(transfer: Stripe.Transfer) {
  console.log("🔄 Processing transfer created:", transfer.id)

  // Update transfer record status
  await prisma.transfer.updateMany({
    where: { stripeTransferId: transfer.id },
    data: {
      status: "IN_TRANSIT",
      initiatedAt: new Date(transfer.created * 1000),
    },
  })

  console.log("✅ Transfer created status updated")
}

async function handleTransferCompleted(transfer: Stripe.Transfer) {
  console.log("🔄 Processing transfer completion:", transfer.id)

  // Update transfer record
  const transferRecord = await prisma.transfer.findUnique({
    where: { stripeTransferId: transfer.id },
    include: { celebrity: true },
  })

  if (!transferRecord) {
    console.log("⚠️ Transfer record not found:", transfer.id)
    return
  }

  // Update transfer status
  await prisma.transfer.update({
    where: { stripeTransferId: transfer.id },
    data: {
      status: "PAID",
      completedAt: new Date(),
    },
  })

  // Update related order or tip
  if (transferRecord.orderId) {
    await prisma.order.update({
      where: { id: transferRecord.orderId },
      data: {
        transferStatus: "PAID",
        transferredAt: new Date(),
      },
    })
  }

  if (transferRecord.tipId) {
    await prisma.tip.update({
      where: { id: transferRecord.tipId },
      data: {
        transferStatus: "PAID",
        transferredAt: new Date(),
      },
    })
  }

  // Update celebrity earnings
  await prisma.celebrity.update({
    where: { id: transferRecord.celebrityId },
    data: {
      totalEarnings: {
        increment: transfer.amount / 100, // Convert from cents
      },
      lastPayoutAt: new Date(),
    },
  })

  console.log("✅ Transfer completion processed successfully")
}

async function handleTransferFailed(transfer: Stripe.Transfer) {
  console.log("🔄 Processing transfer failure:", transfer.id)

  // Update transfer record
  await prisma.transfer.update({
    where: { stripeTransferId: transfer.id },
    data: {
      status: "FAILED",
      failedAt: new Date(),
      failureReason: "Transfer failed - check Connect account status",
    },
  })

  // Update related order or tip
  const transferRecord = await prisma.transfer.findUnique({
    where: { stripeTransferId: transfer.id },
  })

  if (transferRecord?.orderId) {
    await prisma.order.update({
      where: { id: transferRecord.orderId },
      data: { transferStatus: "FAILED" },
    })
  }

  if (transferRecord?.tipId) {
    await prisma.tip.update({
      where: { id: transferRecord.tipId },
      data: { transferStatus: "FAILED" },
    })
  }

  console.log("✅ Transfer failure processed")
}