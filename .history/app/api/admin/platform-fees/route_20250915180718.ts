import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get financial settings
    let financialSettings = await prisma.financialSettings.findFirst()
    
    // If no financial settings exist, create default ones
    if (!financialSettings) {
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
    }
    
    // Get platform fee transfers
    const transfers = await prisma.platformFeeTransfer.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    // Calculate total platform fees from orders
    const totalPlatformFees = await prisma.order.aggregate({
      _sum: { platformFee: true },
      where: {
        paymentStatus: "SUCCEEDED",
      },
    })

    // Calculate pending platform fees (not yet transferred)
    const pendingPlatformFees = await prisma.order.aggregate({
      _sum: { platformFee: true },
      where: {
        paymentStatus: "SUCCEEDED",
        platformFeeTransferred: false,
      },
    })

    return NextResponse.json({
      financialSettings,
      transfers,
      summary: {
        totalPlatformFees: totalPlatformFees._sum.platformFee || 0,
        pendingPlatformFees: pendingPlatformFees._sum.platformFee || 0,
        totalTransfers: transfers.length,
        successfulTransfers: transfers.filter(t => t.status === "SUCCEEDED").length,
      }
    })
  } catch (error) {
    console.error("Error fetching platform fees:", error)
    return NextResponse.json({ error: "Failed to fetch platform fees" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, ...data } = await request.json()

    switch (action) {
      case "setup_admin_account":
        return await setupAdminAccount(data)
      
      case "transfer_platform_fees":
        return await transferPlatformFees(data)
      
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error processing platform fee action:", error)
    return NextResponse.json({ error: "Failed to process action" }, { status: 500 })
  }
}

async function setupAdminAccount(data: {
  stripeAccountId: string
  email: string
  name: string
}) {
  try {
    // Verify the Stripe account exists and is valid
    const account = await stripe.accounts.retrieve(data.stripeAccountId)
    
    if (account.object !== "account") {
      return NextResponse.json({ error: "Invalid Stripe account" }, { status: 400 })
    }

    // Update or create financial settings
    const financialSettings = await prisma.financialSettings.upsert({
      where: { id: "default" },
      update: {
        adminStripeAccountId: data.stripeAccountId,
        adminStripeAccountStatus: account.charges_enabled ? "ACTIVE" : "PENDING",
        adminStripeAccountEmail: data.email,
        adminStripeAccountName: data.name,
      },
      create: {
        id: "default",
        adminStripeAccountId: data.stripeAccountId,
        adminStripeAccountStatus: account.charges_enabled ? "ACTIVE" : "PENDING",
        adminStripeAccountEmail: data.email,
        adminStripeAccountName: data.name,
      },
    })

    return NextResponse.json({
      message: "Admin Stripe account setup successfully",
      financialSettings,
    })
  } catch (error) {
    console.error("Error setting up admin account:", error)
    return NextResponse.json({ error: "Failed to setup admin account" }, { status: 500 })
  }
}

async function transferPlatformFees(data: { amount?: number }) {
  try {
    // Get financial settings
    const financialSettings = await prisma.financialSettings.findFirst()
    
    if (!financialSettings?.adminStripeAccountId) {
      return NextResponse.json({ 
        error: "Admin Stripe account not configured. Please setup admin account first." 
      }, { status: 400 })
    }

    if (financialSettings.adminStripeAccountStatus !== "ACTIVE") {
      return NextResponse.json({ 
        error: "Admin Stripe account is not active. Please complete Stripe onboarding." 
      }, { status: 400 })
    }

    // Calculate transfer amount
    let transferAmount = data.amount

    if (!transferAmount) {
      // Get all pending platform fees
      const pendingFees = await prisma.order.aggregate({
        _sum: { platformFee: true },
        where: {
          paymentStatus: "SUCCEEDED",
          platformFeeTransferred: false,
        },
      })
      
      transferAmount = pendingFees._sum.platformFee || 0
    }

    if (transferAmount <= 0) {
      return NextResponse.json({ error: "No platform fees available for transfer" }, { status: 400 })
    }

    // Check minimum payout
    if (transferAmount < financialSettings.minimumPayout) {
      return NextResponse.json({ 
        error: `Minimum payout amount is $${financialSettings.minimumPayout}. Current amount: $${transferAmount}` 
      }, { status: 400 })
    }

    // Create Stripe transfer
    const transfer = await stripe.transfers.create({
      amount: Math.round(transferAmount * 100), // Convert to cents
      currency: "nzd",
      destination: financialSettings.adminStripeAccountId,
      description: `Platform fee transfer - ${new Date().toLocaleDateString()}`,
      metadata: {
        type: "platform_fee_transfer",
        adminAccountId: financialSettings.adminStripeAccountId,
        transferAmount: transferAmount.toString(),
      },
    })

    // Create transfer record
    const transferRecord = await prisma.platformFeeTransfer.create({
      data: {
        amount: transferAmount,
        currency: "nzd",
        stripeTransferId: transfer.id,
        status: "SUCCEEDED",
        description: `Platform fee transfer to admin account`,
        metadata: {
          transferId: transfer.id,
          adminAccountId: financialSettings.adminStripeAccountId,
          adminAccountName: financialSettings.adminStripeAccountName,
        },
      },
    })

    // Mark orders as transferred
    await prisma.order.updateMany({
      where: {
        paymentStatus: "SUCCEEDED",
        platformFeeTransferred: false,
      },
      data: {
        platformFeeTransferred: true,
      },
    })

    // Update financial settings
    await prisma.financialSettings.update({
      where: { id: financialSettings.id },
      data: {
        platformFeeBalance: 0,
        lastPlatformFeePayout: new Date(),
      },
    })

    return NextResponse.json({
      message: "Platform fees transferred successfully",
      transfer: transferRecord,
      amount: transferAmount,
    })
  } catch (error) {
    console.error("Error transferring platform fees:", error)
    return NextResponse.json({ error: "Failed to transfer platform fees" }, { status: 500 })
  }
}
