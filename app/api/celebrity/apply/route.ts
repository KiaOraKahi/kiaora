import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendApplicationStatusEmail } from "@/lib/email"
import { Console } from "console"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields (simplified)
    const requiredFields = ["fullName", "email", "phone", "dateOfBirth", "category", "experience", "languages"]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    console.log("body : ", body);

    // Validate experience length
    if (body.experience.length < 50) {
      return NextResponse.json({ error: "Experience description must be at least 50 characters" }, { status: 400 })
    }

    // Validate languages array
    if (!Array.isArray(body.languages) || body.languages.length === 0) {
      return NextResponse.json({ error: "At least one language must be selected" }, { status: 400 })
    }

    // Check if application already exists
    const existingApplication = await prisma.celebrityApplication.findUnique({
      where: { email: body.email },
    })

    if (existingApplication) {
      return NextResponse.json({ error: "An application with this email already exists" }, { status: 400 })
    }

    // Extract social media data
    const socialMedia = body.socialMedia || {}

    // Create the application with all required fields
    const application = await prisma.celebrityApplication.create({
      data: {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        dateOfBirth: body.dateOfBirth,
        nationality: body.nationality || "Not specified",
        profession: body.category, // Using category as profession
        category: body.category,
        experience: body.experience,
        achievements: body.experience, // Using experience as achievements
        instagramHandle: socialMedia.instagram || null,
        twitterHandle: socialMedia.twitter || null,
        tiktokHandle: socialMedia.tiktok || null,
        youtubeHandle: socialMedia.youtube || null,
        otherSocialMedia: socialMedia.other || null,
        followerCount: "0", // Default value
        basePrice: 299.0, // Default base price
        rushPrice: 399.0, // Default rush price
        languages: body.languages,
        availability: "24 hours", // Default availability
        specialRequests: body.specialRequests || null,
        motivation: body.experience, // Using experience as motivation
        hasProfilePhoto: body.hasProfilePhoto || false,
        hasIdDocument: body.hasIdDocument || false,
        hasVerificationDocument: body.hasVerificationDocument || false,
        profilePhotoUrl: body.profilePhotoUrl || null,
        idDocumentUrl: body.idDocumentUrl || null,
        verificationDocumentUrl: body.verificationDocumentUrl || null,
        status: "PENDING",
      },
    })

    console.log("✅ Celebrity application created:", application.id)

    // Send confirmation email
    try {
      await sendApplicationStatusEmail(
        application.email,
        application.fullName,
        "PENDING",
        "Thank you for applying to become talent on Kia Ora Kahi! We've received your application and will review it within 2-3 business days.",
      )
    } catch (emailError) {
      console.error("❌ Failed to send confirmation email:", emailError)
      // Don't fail the application if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully! We'll review it and get back to you within 2-3 business days.",
      applicationId: application.id,
    })
  } catch (error) {
    console.error("❌ Celebrity application error:", error)
    return NextResponse.json({ error: "Failed to submit application. Please try again." }, { status: 500 })
  }
}
