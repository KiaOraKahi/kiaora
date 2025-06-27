import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendApplicationStatusEmail } from "@/lib/email"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const application = await prisma.celebrityApplication.findUnique({
      where: { id: params.id },
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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status, reviewNotes, reviewedBy } = body

    const application = await prisma.celebrityApplication.findUnique({
      where: { id: params.id },
    })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Update application
    const updatedApplication = await prisma.celebrityApplication.update({
      where: { id: params.id },
      data: {
        status,
        reviewNotes,
        reviewedBy,
        reviewedAt: new Date(),
      },
    })

    // If approved, create celebrity profile
    if (status === "APPROVED") {
      try {
        // Check if user already exists
        let user = await prisma.user.findUnique({
          where: { email: application.email },
        })

        if (!user) {
          // Create new user
          user = await prisma.user.create({
            data: {
              name: application.fullName,
              email: application.email,
              role: "CELEBRITY",
              isVerified: true,
              emailVerified: new Date(),
            },
          })
        } else {
          // Update existing user to celebrity
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              role: "CELEBRITY",
              isVerified: true,
            },
          })
        }

        // Create celebrity profile
        await prisma.celebrity.create({
          data: {
            userId: user.id,
            bio: `${application.profession} specializing in ${application.category}`,
            category: application.category,
            price: application.basePrice,
            isActive: true,
          },
        })

        console.log("✅ Celebrity profile created for:", application.email)
      } catch (profileError) {
        console.error("❌ Error creating celebrity profile:", profileError)
        // Continue with email notification even if profile creation fails
      }
    }

    // Send status update email
    try {
      let emailMessage = ""
      switch (status) {
        case "UNDER_REVIEW":
          emailMessage = "Your application is now under review. We'll get back to you soon!"
          break
        case "APPROVED":
          emailMessage =
            "Congratulations! Your application has been approved. Welcome to Kia Ora Kahi! You can now start creating your celebrity profile and earning money through personalized video messages."
          break
        case "REJECTED":
          emailMessage = `Thank you for your interest in Kia Ora Kahi. Unfortunately, we cannot approve your application at this time. ${reviewNotes ? `Reason: ${reviewNotes}` : ""}`
          break
        case "REQUIRES_CHANGES":
          emailMessage = `Your application requires some changes before we can proceed. Please review the following: ${reviewNotes || "Please contact support for more details."}`
          break
        default:
          emailMessage = "Your application status has been updated."
      }

      await sendApplicationStatusEmail(application.email, application.fullName, status, emailMessage, reviewNotes)
    } catch (emailError) {
      console.error("❌ Failed to send status email:", emailError)
      // Don't fail the status update if email fails
    }

    return NextResponse.json({
      message: "Application status updated successfully",
      application: updatedApplication,
    })
  } catch (error) {
    console.error("❌ Error updating application:", error)
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
  }
}
