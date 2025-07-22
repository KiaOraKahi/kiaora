import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  sendVideoApprovalConfirmation,
  sendVideoDeclineNotificationToCelebrity,
  sendVideoDeclineConfirmation,
} from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    console.log("📧 Send Approval Emails API - Starting...")

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log("❌ Send Approval Emails API - No session or user ID")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { orderNumber, action, declineReason } = body

    if (!orderNumber || !action) {
      return NextResponse.json({ error: "Order number and action are required" }, { status: 400 })
    }

    if (!["approve", "decline"].includes(action)) {
      return NextResponse.json({ error: "Action must be 'approve' or 'decline'" }, { status: 400 })
    }

    if (action === "decline" && (!declineReason || declineReason.trim().length === 0)) {
      return NextResponse.json({ error: "Decline reason is required when declining video" }, { status: 400 })
    }

    console.log("📋 Email Request Details:")
    console.log("   - Order Number:", orderNumber)
    console.log("   - Action:", action)
    console.log("   - User ID:", session.user.id)

    // Get order details with all necessary relationships
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: orderNumber,
        userId: session.user.id, // Ensure user owns this order
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        celebrity: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      console.log("❌ Order not found or not owned by user:", { orderNumber, userId: session.user.id })
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    console.log("✅ Order found:", {
      orderId: order.id,
      status: order.status,
      approvalStatus: order.approvalStatus,
      customerName: order.user?.name,
      celebrityName: order.celebrity?.user?.name,
    })

    const emailResults: { type: string; success: boolean; error?: string }[] = []

    if (action === "approve") {
      // Send approval confirmation to customer
      try {
        console.log("📧 Sending approval confirmation to customer...")
        const customerResult = await sendVideoApprovalConfirmation(
          order.user?.email || "",
          order.user?.name || "Customer",
          {
            orderNumber: order.orderNumber,
            celebrityName: order.celebrity?.user?.name || "Celebrity",
            recipientName: order.recipientName,
            occasion: order.occasion,
            amount: order.totalAmount,
            videoUrl: order.videoUrl || "",
          },
        )

        emailResults.push({
          type: "customer_approval_confirmation",
          success: customerResult.success,
          error: customerResult.success ? undefined : customerResult.error,
        })

        if (customerResult.success) {
          console.log("✅ Customer approval confirmation sent successfully")
        } else {
          console.error("❌ Failed to send customer approval confirmation:", customerResult.error)
        }
      } catch (error) {
        console.error("❌ Error sending customer approval confirmation:", error)
        emailResults.push({
          type: "customer_approval_confirmation",
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    } else if (action === "decline") {
      // Send decline notification to celebrity
      try {
        console.log("📧 Sending decline notification to celebrity...")
        const celebrityResult = await sendVideoDeclineNotificationToCelebrity(
          order.celebrity?.user?.email || "",
          order.celebrity?.user?.name || "Celebrity",
          {
            orderNumber: order.orderNumber,
            customerName: order.user?.name || "Customer",
            recipientName: order.recipientName,
            occasion: order.occasion,
            declineReason: declineReason,
            revisionCount: (order.revisionCount || 0) + 1,
            maxRevisions: order.maxRevisions || 2,
          },
        )

        emailResults.push({
          type: "celebrity_decline_notification",
          success: celebrityResult.success,
          error: celebrityResult.success ? undefined : celebrityResult.error,
        })

        if (celebrityResult.success) {
          console.log("✅ Celebrity decline notification sent successfully")
        } else {
          console.error("❌ Failed to send celebrity decline notification:", celebrityResult.error)
        }
      } catch (error) {
        console.error("❌ Error sending celebrity decline notification:", error)
        emailResults.push({
          type: "celebrity_decline_notification",
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }

      // Send decline confirmation to customer
      try {
        console.log("📧 Sending decline confirmation to customer...")
        const customerResult = await sendVideoDeclineConfirmation(
          order.user?.email || "",
          order.user?.name || "Customer",
          {
            orderNumber: order.orderNumber,
            celebrityName: order.celebrity?.user?.name || "Celebrity",
            recipientName: order.recipientName,
            occasion: order.occasion,
            declineReason: declineReason,
            revisionCount: (order.revisionCount || 0) + 1,
            maxRevisions: order.maxRevisions || 2,
          },
        )

        emailResults.push({
          type: "customer_decline_confirmation",
          success: customerResult.success,
          error: customerResult.success ? undefined : customerResult.error,
        })

        if (customerResult.success) {
          console.log("✅ Customer decline confirmation sent successfully")
        } else {
          console.error("❌ Failed to send customer decline confirmation:", customerResult.error)
        }
      } catch (error) {
        console.error("❌ Error sending customer decline confirmation:", error)
        emailResults.push({
          type: "customer_decline_confirmation",
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    // Calculate success rate
    const successfulEmails = emailResults.filter((result) => result.success).length
    const totalEmails = emailResults.length
    const allEmailsSuccessful = successfulEmails === totalEmails

    console.log("📧 EMAIL SENDING COMPLETED")
    console.log(`   - Total emails: ${totalEmails}`)
    console.log(`   - Successful: ${successfulEmails}`)
    console.log(`   - Failed: ${totalEmails - successfulEmails}`)

    // Return success even if some emails failed (non-blocking)
    return NextResponse.json({
      success: true,
      message: `${action === "approve" ? "Approval" : "Decline"} emails processed`,
      emailResults,
      emailStats: {
        total: totalEmails,
        successful: successfulEmails,
        failed: totalEmails - successfulEmails,
        allSuccessful: allEmailsSuccessful,
      },
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        approvalStatus: order.approvalStatus,
      },
    })
  } catch (error) {
    console.error("❌ Error in send approval emails API:", error)
    return NextResponse.json(
      {
        error: "Failed to send emails",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}