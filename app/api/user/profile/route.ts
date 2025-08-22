import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user profile from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userProfile = {
      id: user.id,
      name: user.name || "User",
      email: user.email || "user@example.com",
      phone: "+1 (555) 123-4567", // This could be stored in a separate profile table
      avatar: user.image || "/placeholder.svg",
      preferences: {
        notifications: true,
        marketing: false,
        language: "en",
        timezone: "America/New_York",
      },
    }

    return NextResponse.json(userProfile)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Update user profile in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: body.name || session.user.name,
        email: body.email || session.user.email,
        // Note: image is updated separately via the profile-image endpoint
      },
    })

    const updatedProfile = {
      id: updatedUser.id,
      name: updatedUser.name || "User",
      email: updatedUser.email || "user@example.com",
      phone: body.phone || "+1 (555) 123-4567",
      avatar: updatedUser.image || "/placeholder.svg",
      preferences: {
        notifications: body.preferences?.notifications ?? true,
        marketing: body.preferences?.marketing ?? false,
        language: body.preferences?.language || "en",
        timezone: body.preferences?.timezone || "America/New_York",
      },
    }

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
  }
} 