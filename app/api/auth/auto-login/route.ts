import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { loginToken } = await request.json()

    if (!loginToken) {
      return NextResponse.json({ error: "Login token is required" }, { status: 400 })
    }

    // Verify the login token
    const decoded = jwt.verify(loginToken, process.env.NEXTAUTH_SECRET!) as {
      userId: string
      email: string
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
      },
    })

    if (!user || !user.isVerified) {
      return NextResponse.json({ error: "Invalid user or not verified" }, { status: 400 })
    }

    return NextResponse.json({
      message: "Auto-login successful",
      user,
    })
  } catch (error) {
    console.error("Auto-login error:", error)
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
  }
}
