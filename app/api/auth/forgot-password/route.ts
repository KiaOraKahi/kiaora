import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { forgotPasswordSchema } from "@/lib/validations/auth"
import { sendPasswordResetEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Don't reveal if user exists or not
      return NextResponse.json({
        message: "If an account with that email exists, we've sent a password reset link.",
      })
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex")

    await prisma.verificationToken.create({
      data: {
        email,
        token,
        type: "PASSWORD_RESET",
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    })

    // Send reset email
    await sendPasswordResetEmail(email, token)

    return NextResponse.json({
      message: "If an account with that email exists, we've sent a password reset link.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}