import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has FAN role
    if (session.user.role !== "FAN") {
      return NextResponse.json({ 
        error: "Only users with FAN role can upload profile images" 
      }, { status: 403 })
    }

    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        error: "File size too large. Maximum 5MB allowed." 
      }, { status: 400 })
    }

    // Validate file type - only images allowed for profile
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Only images (JPEG, PNG, WebP) are allowed for profile pictures." 
      }, { status: 400 })
    }

    // Generate unique filename for profile images
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filename = `profile-images/${session.user.id}-${timestamp}-${sanitizedFileName}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    console.log("✅ Profile image uploaded to Vercel Blob:", blob.url)

    // Update user's profile image in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: blob.url }
    })

    return NextResponse.json({
      message: "Profile image uploaded successfully",
      filename: blob.pathname,
      url: blob.url,
      size: file.size,
    })
  } catch (error) {
    console.error("❌ Profile image upload error:", error)
    return NextResponse.json({ error: "Failed to upload profile image" }, { status: 500 })
  }
}
