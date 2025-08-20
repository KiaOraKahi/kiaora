import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createConnectAccount, createAccountLink, createLoginLink } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action } = await request.json()

    // Find celebrity profile with user data
    const celebrity = await prisma.celebrity.findUnique({
      where: { userId: session.user.id },
      include: { user: true },
    })

    if (!celebrity) {
      return NextResponse.json({ error: "Celebrity profile not found" }, { status: 404 })
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

    switch (action) {
      case "create": {
        // Create new Stripe Connect account
        try {
          const { accountId, onboardingUrl } = await createConnectAccount({
            email: celebrity.user.email,
            name: celebrity.user.name || "Celebrity User",
            country: "NZ", // Default to New Zealand, can be made dynamic
            businessType: "individual"
          })

          // Update celebrity record with account ID
          await prisma.celebrity.update({
            where: { id: celebrity.id },
            data: {
              stripeConnectAccountId: accountId,
              stripeAccountStatus: "PENDING",
              stripePayoutsEnabled: false,
            },
          })

          return NextResponse.json({ onboardingUrl })
        } catch (error) {
          console.error("❌ Error creating Stripe account:", error)
          console.error("🔍 Error details:", {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            celebrity: {
              id: celebrity.id,
              email: celebrity.user.email,
              name: celebrity.user.name
            }
          })
          return NextResponse.json({ 
            error: "Failed to create Stripe account",
            details: error instanceof Error ? error.message : "Unknown error"
          }, { status: 500 })
        }
      }

      case "continue": {
        // Continue existing onboarding
        if (!celebrity.stripeConnectAccountId) {
          return NextResponse.json({ error: "No Stripe account found" }, { status: 400 })
        }

        try {
          const accountLink = await createAccountLink(
            celebrity.stripeConnectAccountId,
            `${baseUrl}/celebrity-dashboard?setup=refresh`,
            `${baseUrl}/celebrity-dashboard?setup=complete`,
          )
          return NextResponse.json({ onboardingUrl: accountLink.url })
        } catch (error) {
          console.error("Error creating onboarding link:", error)
          return NextResponse.json({ error: "Failed to create onboarding link" }, { status: 500 })
        }
      }

      case "dashboard": {
        // Access Stripe dashboard
        if (!celebrity.stripeConnectAccountId) {
          return NextResponse.json({ error: "No Stripe account found" }, { status: 400 })
        }

        try {
          const dashboardUrl = await createLoginLink(celebrity.stripeConnectAccountId)
          return NextResponse.json({ dashboardUrl })
        } catch (error) {
          console.error("Error creating dashboard link:", error)
          return NextResponse.json({ error: "Failed to create dashboard link" }, { status: 500 })
        }
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in Stripe Connect route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
