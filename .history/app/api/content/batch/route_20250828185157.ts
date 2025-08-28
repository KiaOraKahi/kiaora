import { NextRequest, NextResponse } from "next/server"
import { getContentByKeys } from "@/lib/content-utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { keys } = body

    if (!keys || !Array.isArray(keys)) {
      return NextResponse.json({ error: "Keys array is required" }, { status: 400 })
    }

    const content = await getContentByKeys(keys)
    
    return NextResponse.json(content)
  } catch (error) {
    console.error("Error fetching batch content:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
