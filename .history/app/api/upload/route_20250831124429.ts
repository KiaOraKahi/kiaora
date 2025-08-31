import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

// This route handles large file uploads
// Next.js App Router automatically handles large files

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File
    const type: string = data.get("type") as string

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 })
    }

    // Validate file size based on type
    const maxSize = type === "video" ? 50 * 1024 * 1024 : 5 * 1024 * 1024 // 50MB for videos, 5MB for others
    if (file.size > maxSize) {
      const maxSizeMB = type === "video" ? "50MB" : "5MB"
      return NextResponse.json({ error: `File size too large. Maximum ${maxSizeMB} allowed.` }, { status: 400 })
    }

    // Validate file type based on type parameter
    let allowedTypes: string[]
    if (type === "video") {
      allowedTypes = ["video/mp4", "video/mov", "video/avi", "video/quicktime", "video/webm"]
    } else {
      allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"]
    }
    
    if (!allowedTypes.includes(file.type)) {
      const fileTypeDesc = type === "video" ? "video files (MP4, MOV, AVI, QuickTime, or WebM)" : "images and PDFs"
      return NextResponse.json({ error: `Invalid file type. Only ${fileTypeDesc} are allowed.` }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filename = `celebrity-applications/${type}-${timestamp}-${sanitizedFileName}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    console.log("✅ File uploaded to Vercel Blob:", blob.url)

    return NextResponse.json({
      message: "File uploaded successfully",
      filename: blob.pathname,
      url: blob.url,
      type,
      size: file.size,
    })
  } catch (error) {
    console.error("❌ Upload error:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}