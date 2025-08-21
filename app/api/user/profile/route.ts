import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mock user profile data for demonstration
    const userProfile = {
      id: session.user.id || "1",
      name: session.user.name || "User",
      email: session.user.email || "user@example.com",
      phone: "+1 (555) 123-4567",
      avatar: session.user.image || "/placeholder.svg",
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
    
    // Mock profile update for demonstration
    const updatedProfile = {
      id: session.user.id || "1",
      name: body.name || session.user.name,
      email: body.email || session.user.email,
      phone: body.phone || "+1 (555) 123-4567",
      avatar: session.user.image || "/placeholder.svg",
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