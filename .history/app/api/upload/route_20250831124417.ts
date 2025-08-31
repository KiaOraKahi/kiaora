import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File
    const type: string = data.get("type") as string

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 })
    }

    // Validate file size based on type
<<<<<<< HEAD
    let maxSize: number
    let allowedTypes: string[]
    
    if (type === "video") {
      maxSize = 50 * 1024 * 1024 // 50MB for videos
      allowedTypes = ["video/mp4", "video/mov", "video/avi", "video/quicktime", "video/webm"]
    } else {
      maxSize = 5 * 1024 * 1024 // 5MB for images and documents
      allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"]
    }

    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024)
      return NextResponse.json({ 
        error: `File size too large. Maximum ${maxSizeMB}MB allowed for ${type} files.` 
      }, { status: 400 })
    }

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      if (type === "video") {
        return NextResponse.json({ 
          error: "Invalid video format. Only MP4, MOV, AVI, and WebM files are allowed." 
        }, { status: 400 })
      } else {
        return NextResponse.json({ 
          error: "Invalid file type. Only images and PDFs are allowed." 
        }, { status: 400 })
      }
=======
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
>>>>>>> f22cf2d7b844dca034c1f94e8ff28bb4ec513b55
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