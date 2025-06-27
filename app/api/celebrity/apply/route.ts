import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendApplicationStatusEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "dateOfBirth",
      "nationality",
      "profession",
      "category",
      "experience",
      "achievements",
      "followerCount",
      "basePrice",
      "rushPrice",
      "languages",
      "availability",
      "motivation",
    ]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
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

    // Create the application
    const application = await prisma.celebrityApplication.create({
      data: {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        dateOfBirth: body.dateOfBirth,
        nationality: body.nationality,
        profession: body.profession,
        category: body.category,
        experience: body.experience,
        achievements: body.achievements,
        instagramHandle: socialMedia.instagram || null,
        twitterHandle: socialMedia.twitter || null,
        tiktokHandle: socialMedia.tiktok || null,
        youtubeHandle: socialMedia.youtube || null,
        otherSocialMedia: socialMedia.other || null,
        followerCount: body.followerCount,
        basePrice: Number.parseFloat(body.basePrice),
        rushPrice: Number.parseFloat(body.rushPrice),
        languages: body.languages,
        availability: body.availability,
        specialRequests: body.specialRequests || null,
        motivation: body.motivation,
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
