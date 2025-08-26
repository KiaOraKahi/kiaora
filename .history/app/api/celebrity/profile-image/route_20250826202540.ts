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

    // Check if user has CELEBRITY role
    if (session.user.role !== "CELEBRITY") {
      return NextResponse.json({ 
        error: "Only users with CELEBRITY role can upload profile images" 
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

    // Generate unique filename for celebrity profile images
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filename = `celebrity-profile-images/${session.user.id}-${timestamp}-${sanitizedFileName}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    console.log("✅ Celebrity profile image uploaded to Vercel Blob:", blob.url)

    // Update user's profile image in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: blob.url }
    })

    console.log("✅ User profile image updated:", updatedUser.image)

    // Also update the celebrity's cover image
    const updatedCelebrity = await prisma.celebrity.update({
      where: { userId: session.user.id },
      data: { coverImage: blob.url }
    })

    console.log("✅ Celebrity cover image updated:", updatedCelebrity.coverImage)

    return NextResponse.json({
      message: "Profile image uploaded successfully",
      filename: blob.pathname,
      url: blob.url,
      size: file.size,
    })
  } catch (error) {
    console.error("❌ Celebrity profile image upload error:", error)
    return NextResponse.json({ 
      error: "Failed to upload profile image",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
