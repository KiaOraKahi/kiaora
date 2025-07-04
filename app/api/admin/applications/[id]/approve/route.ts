import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const applicationId = params.id

    // Get the application
    const application = await prisma.celebrityApplication.findUnique({
      where: { id: applicationId },
    })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    if (application.status !== "PENDING") {
      return NextResponse.json({ error: "Application already processed" }, { status: 400 })
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Check if user already exists
      let user = await tx.user.findUnique({
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
            image: application.profilePhotoUrl, // 🎯 Key: Set user image to uploaded photo
          },
        })
      } else {
        // Update existing user to celebrity role and set profile image
        user = await tx.user.update({
          where: { id: user.id },
          data: {
            role: "CELEBRITY",
            isVerified: true,
            image: application.profilePhotoUrl, // 🎯 Key: Update user image
          },
        })
      }

      // Create celebrity profile
      const celebrity = await tx.celebrity.create({
        data: {
          userId: user.id,
          bio: `${application.profession} with ${application.experience}`,
          longBio: application.achievements,
          category: application.category,
          pricePersonal: application.basePrice,
          priceBusiness: application.rushPrice,
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
        },
      })

      // Update application status
      await tx.celebrityApplication.update({
        where: { id: applicationId },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
          reviewNotes: "Application approved and celebrity profile created",
        },
      })

      return { user, celebrity }
    })

    // Send approval email
    try {
      await sendEmail({
        to: application.email,
        subject: "🎉 Welcome to Kia Ora - Your Application Has Been Approved!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Kia Ora!</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your celebrity application has been approved</p>
            </div>
            
            <div style="padding: 40px 20px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">Congratulations, ${application.fullName}!</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                We're excited to welcome you to the Kia Ora celebrity network! Your application has been reviewed and approved.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">Your Profile Details:</h3>
                <ul style="color: #666; line-height: 1.8;">
                  <li><strong>Category:</strong> ${application.category}</li>
                  <li><strong>Base Price:</strong> $${application.basePrice}</li>
                  <li><strong>Rush Price:</strong> $${application.rushPrice}</li>
                  <li><strong>Languages:</strong> ${application.languages?.join(", ") || "English"}</li>
                </ul>
              </div>
              
              <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1976d2; margin-top: 0;">Next Steps:</h3>
                <ol style="color: #666; line-height: 1.8;">
                  <li>Log in to your celebrity dashboard to complete your profile</li>
                  <li>Upload sample videos to showcase your work</li>
                  <li>Set your availability and booking preferences</li>
                  <li>Start receiving and fulfilling booking requests</li>
                </ol>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL}/celebrity-dashboard" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 25px; 
                          font-weight: bold;
                          display: inline-block;">
                  Access Your Dashboard
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-top: 30px;">
                If you have any questions or need assistance, please don't hesitate to contact our support team.
              </p>
              
              <p style="color: #666; line-height: 1.6;">
                Welcome to the family!<br>
                <strong>The Kia Ora Team</strong>
              </p>
            </div>
          </div>
        `,
      })
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError)
      // Don't fail the entire operation if email fails
    }

    return NextResponse.json({
      message: "Application approved successfully",
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        image: result.user.image,
      },
      celebrity: {
        id: result.celebrity.id,
        category: result.celebrity.category,
        pricePersonal: result.celebrity.pricePersonal,
      },
    })
  } catch (error) {
    console.error("Error approving application:", error)
    return NextResponse.json({ error: "Failed to approve application" }, { status: 500 })
  }
}
