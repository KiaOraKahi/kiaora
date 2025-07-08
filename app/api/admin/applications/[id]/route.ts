import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendApplicationStatusEmail } from "@/lib/email"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const application = await prisma.celebrityApplication.findUnique({
      where: { id },
    })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error("❌ Error fetching application:", error)
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    // Check if user is admin
    console.log("🔍 Session in PATCH route:", session)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { status, reviewNotes } = body

    // Get the application first
    const application = await prisma.celebrityApplication.findUnique({
      where: { id },
    })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update application status
      const updatedApplication = await tx.celebrityApplication.update({
        where: { id },
        data: {
          status,
          reviewNotes,
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
        },
      })

      let user = null
      let celebrity = null

      // If approved, create user and celebrity records
      if (status === "APPROVED") {
        console.log("🎯 Creating user and celebrity records for approved application")
        console.log("📸 Profile photo URL:", application.profilePhotoUrl)

        // Check if user already exists
        user = await tx.user.findUnique({
          where: { email: application.email },
        })

        if (!user) {
          // Create new user account with the uploaded profile photo
          const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10)
          user = await tx.user.create({
            data: {
              name: application.fullName,
              email: application.email,
              role: "CELEBRITY",
              isVerified: true,
              password: hashedPassword,
              image: application.profilePhotoUrl, // Save profile photo to user table
              emailVerified: new Date(),
            },
          })
          console.log("✅ New user created with profile image:", user.image)
        } else {
          // Update existing user to celebrity role and set profile image
          user = await tx.user.update({
            where: { id: user.id },
            data: {
              role: "CELEBRITY",
              isVerified: true,
              image: application.profilePhotoUrl, // Update profile photo in user table
            },
          })
          console.log("✅ Existing user updated with profile image:", user.image)
        }

        // Create celebrity profile
        celebrity = await tx.celebrity.create({
          data: {
            userId: user.id,
            bio: `${application.profession} with ${application.experience}`,
            longBio: application.achievements,
            category: application.category,
            pricePersonal: application.basePrice,
            priceBusiness: application.rushPrice || Math.round(application.basePrice * 1.5),
            priceCharity: Math.round(application.basePrice * 0.8), // 20% discount for charity
            rating: 4.5,
            averageRating: 4.5,
            totalReviews: 0,
            completionRate: 95,
            responseTime: application.availability || "24 hours",
            isActive: true,
            verified: true,
            featured: false,
            tags: application.languages || [],
            achievements: [application.achievements],
            nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            coverImage: application.profilePhotoUrl, // Save profile photo to celebrity table
          },
        })
        console.log("✅ Celebrity profile created with cover image:", celebrity.coverImage)
      }

      return { updatedApplication, user, celebrity }
    })

    // Send status email (don't fail if email fails)
    let emailMessage = ""
    if (status === "APPROVED") {
      emailMessage =
        "🎉 Congratulations! Your celebrity application has been approved. Welcome to Kia Ora! You can now access your celebrity dashboard and start receiving booking requests."
    } else if (status === "REJECTED") {
      emailMessage =
        "Thank you for your interest in joining Kia Ora. After careful review, we're unable to approve your application at this time."
    } else if (status === "UNDER_REVIEW") {
      emailMessage =
        "Your application is currently under review by our team. We'll notify you once the review is complete."
    } else if (status === "REQUIRES_CHANGES") {
      emailMessage =
        "Your application requires some changes before it can be approved. Please review the notes below and resubmit."
    }

    try {
      await sendApplicationStatusEmail(application.email, application.fullName, status, emailMessage, reviewNotes)
      console.log("✅ Status email sent successfully")
    } catch (emailError) {
      console.error("❌ Failed to send status email:", emailError)
      // Don't fail the entire operation if email fails
    }

    return NextResponse.json({
      message: "Application status updated successfully",
      application: result.updatedApplication,
      user: result.user
        ? {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
            image: result.user.image,
          }
        : null,
      celebrity: result.celebrity
        ? {
            id: result.celebrity.id,
            category: result.celebrity.category,
            pricePersonal: result.celebrity.pricePersonal,
            coverImage: result.celebrity.coverImage,
          }
        : null,
    })
  } catch (error) {
    console.error("❌ Error updating application:", error)
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
  }
}