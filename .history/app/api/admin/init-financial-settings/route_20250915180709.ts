import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    console.log("🔄 Initializing financial settings...")

    // Check if financial settings already exist
    let financialSettings = await prisma.financialSettings.findFirst()

    if (financialSettings) {
      console.log("✅ Financial settings already exist")
      return NextResponse.json({
        message: "Financial settings already exist",
        financialSettings: {
          id: financialSettings.id,
          platformFee: financialSettings.platformFee,
          minimumPayout: financialSettings.minimumPayout,
          payoutSchedule: financialSettings.payoutSchedule,
          adminStripeAccountId: financialSettings.adminStripeAccountId,
          adminStripeAccountStatus: financialSettings.adminStripeAccountStatus,
          platformFeeBalance: financialSettings.platformFeeBalance
        }
      })
    }

    // Create default financial settings
    financialSettings = await prisma.financialSettings.create({
      data: {
        id: "default",
        platformFee: 20.0,
        minimumPayout: 50.0,
        payoutSchedule: "weekly",
        platformFeeBalance: 0.0,
        adminStripeAccountStatus: "PENDING"
      }
    })

    console.log("✅ Financial settings created successfully")

    return NextResponse.json({
      message: "Financial settings initialized successfully",
      financialSettings: {
        id: financialSettings.id,
        platformFee: financialSettings.platformFee,
        minimumPayout: financialSettings.minimumPayout,
        payoutSchedule: financialSettings.payoutSchedule,
        adminStripeAccountId: financialSettings.adminStripeAccountId,
        adminStripeAccountStatus: financialSettings.adminStripeAccountStatus,
        platformFeeBalance: financialSettings.platformFeeBalance
      }
    })

  } catch (error) {
    console.error("❌ Error initializing financial settings:", error)
    return NextResponse.json({ 
      error: "Failed to initialize financial settings",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
