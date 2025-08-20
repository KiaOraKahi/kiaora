import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current settings from database or return defaults
    const siteSettingsRecord = await prisma.siteSettings.findFirst()
    const siteSettings = siteSettingsRecord || {
      siteName: "Kia Ora Kahi",
      siteDescription: "Connect with celebrities for personalized video messages",
      contactEmail: "admin@kiaora.com"
    }

    const financialSettingsRecord = await prisma.financialSettings.findFirst()
    const financialSettings = financialSettingsRecord || {
      platformFee: 20,
      minimumPayout: 50,
      payoutSchedule: "weekly"
    }

    return NextResponse.json({
      siteSettings,
      financialSettings
    })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { siteSettings, financialSettings } = body

    // Update or create site settings
    if (siteSettings) {
      const existingSiteSettings = await prisma.siteSettings.findFirst()
      if (existingSiteSettings) {
        await prisma.siteSettings.update({
          where: { id: existingSiteSettings.id },
          data: siteSettings
        })
      } else {
        await prisma.siteSettings.create({
          data: siteSettings
        })
      }
    }

    // Update or create financial settings
    if (financialSettings) {
      const existingFinancialSettings = await prisma.financialSettings.findFirst()
      if (existingFinancialSettings) {
        await prisma.financialSettings.update({
          where: { id: existingFinancialSettings.id },
          data: financialSettings
        })
      } else {
        await prisma.financialSettings.create({
          data: financialSettings
        })
      }
    }

    return NextResponse.json({ message: "Settings updated successfully" })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
