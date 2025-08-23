import { type NextRequest, NextResponse } from "next/server"

console.log("📦 APPROVAL API - Basic imports loaded")

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  console.log("🚀 APPROVAL API CALLED - Starting function...")
  
  try {
    console.log("📝 Getting params...")
    const { orderNumber } = await params
    console.log("🔢 Order number:", orderNumber)

    if (!orderNumber) {
      console.log("❌ No order number provided")
      return NextResponse.json({ error: "Order number is required" }, { status: 400 })
    }

    console.log("✅ Basic validation passed")
    
    // For now, just return success to test if the basic API structure works
    return NextResponse.json({
      success: true,
      message: "Basic API structure working - imports and basic logic OK",
      orderNumber,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error("❌ Basic approval API error:", error)
    return NextResponse.json(
      {
        error: "Basic API failed",
        details: error.message,
      },
      { status: 500 }
    )
  }
}