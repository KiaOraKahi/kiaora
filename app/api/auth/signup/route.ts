import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { signUpSchema } from "@/lib/validations/auth"
import { sendVerificationEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role } = signUpSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      if (!existingUser.isVerified) {
        // User exists but not verified, resend verification email
        const verificationToken = crypto.randomBytes(32).toString("hex")

        // Delete old verification tokens
        await prisma.verificationToken.deleteMany({
          where: { email },
        })

        // Create new verification token
        await prisma.verificationToken.create({
          data: {
            email,
            token: verificationToken,
            type: "EMAIL_VERIFICATION",
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        })

        await sendVerificationEmail(email, verificationToken)

        return NextResponse.json(
          {
            message: "Account already exists but not verified. We've sent a new verification email.",
          },
          { status: 200 },
        )
      }

      return NextResponse.json({ error: "User with this email already exists and is verified" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    })

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")

    await prisma.verificationToken.create({
      data: {
        email,
        token: verificationToken,
        type: "EMAIL_VERIFICATION",
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    // Send verification email
    await sendVerificationEmail(email, verificationToken)

    return NextResponse.json(
      {
        message:
          "Account created successfully! Check your email to verify your account and get automatically logged in.",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}