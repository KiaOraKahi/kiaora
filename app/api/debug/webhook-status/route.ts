import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    return NextResponse.json({
      webhookEndpoint: "/api/webhooks/stripe",
      environment: {
        hasWebhookSecret: !!webhookSecret,
        hasStripeSecretKey: !!stripeSecretKey,
        webhookSecretLength: webhookSecret?.length || 0,
        stripeKeyLength: stripeSecretKey?.length || 0,
        nodeEnv: process.env.NODE_ENV,
      },
      instructions: {
        step1: "Check Stripe Dashboard → Developers → Webhooks",
        step2: "Ensure webhook endpoint is: https://yourdomain.com/api/webhooks/stripe",
        step3: "Copy webhook signing secret to STRIPE_WEBHOOK_SECRET env var",
        step4: "Ensure webhook listens for: payment_intent.succeeded",
        step5: "Test with the manual trigger tool",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to check webhook status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
