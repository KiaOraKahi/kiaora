import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { signUpSchema } from "@/lib/validations/auth"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role } = signUpSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isVerified: true, // Set as verified immediately
        emailVerified: new Date(), // Mark email as verified
      },
    })

    // Create JWT token for immediate login
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "7d" }
    )

    return NextResponse.json(
      {
        message: "Account created successfully! You are now logged in.",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}