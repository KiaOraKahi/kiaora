import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      return NextResponse.json({ error: "Token has expired" }, { status: 400 })
    }

    // Update user as verified
    await prisma.user.update({
      where: { email: verificationToken.email },
      data: {
        isVerified: true,
        emailVerified: new Date(),
      },
    })

    // Delete the verification token
    await prisma.verificationToken.delete({
      where: { token },
    })

    return NextResponse.json({ message: "Email verified successfully" })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}