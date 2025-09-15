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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { action } = await request.json()

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

    switch (action) {
      case "create": {
        // Create new Stripe Connect account for admin
        try {
          const { accountId, onboardingUrl } = await createConnectAccount({
            email: session.user.email || "admin@kiaora.com",
            name: session.user.name || "Admin User",
            country: "NZ", // Default to New Zealand
            refreshUrl: `${baseUrl}/admin/dashboard?setup=refresh&tab=platform-fees`,
            returnUrl: `${baseUrl}/admin/dashboard?setup=complete&tab=platform-fees`,
          })

          // Update financial settings with account ID
          await prisma.financialSettings.updateMany({
            data: {
              adminStripeAccountId: accountId,
              adminStripeAccountStatus: "PENDING",
              adminStripeAccountEmail: session.user.email || "admin@kiaora.com",
              adminStripeAccountName: session.user.name || "Admin User",
            },
          })

          return NextResponse.json({ onboardingUrl })
        } catch (error) {
          console.error("Error creating admin Stripe account:", error)
          return NextResponse.json({ error: "Failed to create Stripe account" }, { status: 500 })
        }
      }

      case "continue": {
        // Continue existing onboarding
        const financialSettings = await prisma.financialSettings.findFirst()
        
        if (!financialSettings?.adminStripeAccountId) {
          return NextResponse.json({ error: "No Stripe account found" }, { status: 400 })
        }

        try {
          const accountLink = await createAccountLink(
            financialSettings.adminStripeAccountId,
            `${baseUrl}/admin/dashboard?setup=refresh&tab=platform-fees`,
            `${baseUrl}/admin/dashboard?setup=complete&tab=platform-fees`,
          )
          return NextResponse.json({ onboardingUrl: accountLink.url })
        } catch (error) {
          console.error("Error creating onboarding link:", error)
          return NextResponse.json({ error: "Failed to create onboarding link" }, { status: 500 })
        }
      }

      case "dashboard": {
        // Access Stripe dashboard
        console.log("🔄 Admin requesting dashboard access")
        
        const financialSettings = await prisma.financialSettings.findFirst()
        
        if (!financialSettings?.adminStripeAccountId) {
          console.log("❌ No admin Stripe account found in database")
          return NextResponse.json({ error: "No Stripe account found. Please complete the setup process first." }, { status: 400 })
        }

        console.log("✅ Found admin Stripe account:", financialSettings.adminStripeAccountId)

        try {
          const loginLink = await createLoginLink(financialSettings.adminStripeAccountId)
          console.log("✅ Dashboard link created successfully")
          return NextResponse.json({ dashboardUrl: loginLink })
        } catch (error) {
          console.error("❌ Error creating dashboard link:", error)
          const errorMessage = error instanceof Error ? error.message : "Failed to create dashboard link"
          return NextResponse.json({ error: errorMessage }, { status: 500 })
        }
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in admin Stripe Connect:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
