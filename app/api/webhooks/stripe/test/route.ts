import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Webhook endpoint is accessible",
    timestamp: new Date().toISOString(),
    url: request.url,
    method: "GET",
  })
}

export async function POST(request: NextRequest) {
  console.log("🧪 TEST: Webhook POST endpoint called")

  try {
    const body = await request.text()
    const headers = Object.fromEntries(request.headers.entries())

    console.log("📋 Request details:")
    console.log("   - Body length:", body.length)
    console.log("   - Headers:", headers)
    console.log("   - Has stripe-signature:", !!headers["stripe-signature"])

    return NextResponse.json({
      message: "Webhook POST endpoint is accessible",
      timestamp: new Date().toISOString(),
      bodyLength: body.length,
      hasStripeSignature: !!headers["stripe-signature"],
      headers: headers,
    })
  } catch (error) {
    console.error("❌ Test webhook error:", error)
    return NextResponse.json(
      {
        error: "Test webhook failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}