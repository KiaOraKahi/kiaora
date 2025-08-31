import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.formData()
    const file = data.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      filename: file.name,
      size: file.size,
      sizeMB: (file.size / (1024 * 1024)).toFixed(2),
      type: file.type
    })
  } catch (error) {
    return NextResponse.json({ 
      error: "Test failed", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}
