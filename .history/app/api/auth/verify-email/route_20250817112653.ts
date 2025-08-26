import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    if (verificationToken.expires < new Date()) {
      return NextResponse.json({ error: "Token has expired" }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { email: verificationToken.email },
      data: {
        isVerified: true,
        emailVerified: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    await prisma.verificationToken.delete({
      where: { token },
    })

    const loginToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "5m" },
    )

    return NextResponse.json({
      message: "Email verified successfully",
      user,
      loginToken,
    })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}