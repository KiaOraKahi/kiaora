import { NextResponse } from "next/server"

export async function GET() {
  console.log("🧪 TEST API - Basic endpoint working")
  
  try {
    return NextResponse.json({
      success: true,
      message: "Basic API endpoint working",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("❌ TEST API Error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
