import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest, { params }: { params: Promise<{ orderNumber: string }> }) {
  try {
    // Await params before using
    const { orderNumber } = await params
    console.log("🔄 Processing video decline request for order:", orderNumber)

    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log("❌ Unauthorized decline attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body with error handling
    let body
    try {
      const rawBody = await request.text()
      console.log("📝 Raw request body:", rawBody)
      
      if (!rawBody || rawBody.trim() === '') {
        console.log("❌ Empty request body")
        return NextResponse.json({ error: "Request body is empty" }, { status: 400 })
      }
      
      body = JSON.parse(rawBody)
      console.log("📝 Parsed request body:", body)
    } catch (parseError) {
      console.error("❌ JSON parsing error:", parseError)
      return NextResponse.json({ 
        error: "Invalid JSON in request body",
        details: parseError instanceof Error ? parseError.message : "Unknown parsing error"
      }, { status: 400 })
    }

    const { reason, reasons, feedback, requestRevision } = body

    // Handle different possible request formats from the modal
    let declineReason = reason || feedback || ""

    // If reasons array is provided (from the modal), join them
    if (reasons && Array.isArray(reasons) && reasons.length > 0) {
      declineReason = reasons.join(", ") + (feedback ? `: ${feedback}` : "")
    }

    console.log("📝 Final decline reason:", declineReason)

    // Validate decline reason
    if (!declineReason || typeof declineReason !== "string" || declineReason.trim().length === 0) {
      console.log("❌ No decline reason provided")
      return NextResponse.json({ error: "Decline reason is required" }, { status: 400 })
    }

    if (declineReason.length > 500) {
      return NextResponse.json({ error: "Decline reason must be 500 characters or less" }, { status: 400 })
    }

    // Find the order with related data
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        user: true,
        celebrity: {
          include: {
            user: true,
          },
        },
        booking: true,
      },
    })

    if (!order) {
      console.log("❌ Order not found:", orderNumber)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    console.log("📊 Order found:", {
      id: order.id,
      status: order.status,
      approvalStatus: order.approvalStatus,
      userId: order.userId,
      sessionUserId: session.user.id,
      hasVideo: !!order.videoUrl,
      revisionCount: order.revisionCount,
      maxRevisions: order.maxRevisions,
    })

    // Verify user owns this order
    if (order.userId !== session.user.id) {
      console.log("❌ User doesn't own order:", session.user.id, "vs", order.userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if order is in the right status for decline
    if (order.approvalStatus !== "PENDING_APPROVAL") {
      console.log("❌ Invalid approval status for decline:", order.approvalStatus)
      return NextResponse.json(
        {
          error: `Order is not pending approval. Current status: ${order.approvalStatus}`,
        },
        { status: 400 },
      )
    }

    // Check if video exists
    if (!order.videoUrl) {
      console.log("❌ No video to decline for order:", orderNumber)
      return NextResponse.json({ error: "No video available to decline" }, { status: 400 })
    }

    // Check revision limits
    if (order.revisionCount >= order.maxRevisions) {
      console.log("❌ Maximum revisions exceeded:", order.revisionCount, ">=", order.maxRevisions)
      return NextResponse.json({ error: "Maximum number of revisions exceeded" }, { status: 400 })
    }

    console.log("✅ Validation passed, processing decline...")

    // Update order with decline information
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        approvalStatus: "DECLINED",
        status: "REVISION_REQUESTED",
        declinedAt: new Date(),
        declineReason: declineReason.trim(),
        revisionCount: order.revisionCount + 1,
        // Clear video URL to indicate new video needed
        videoUrl: null,
        deliveredAt: null,
      },
      include: {
        user: true,
        celebrity: {
          include: {
            user: true,
          },
        },
        booking: true,
      },
    })

    console.log("✅ Order updated with decline status")

    // Send email notification to celebrity about the decline
    if (updatedOrder.celebrity?.user?.email) {
      try {
        await sendEmail({
          to: updatedOrder.celebrity.user.email,
          subject: `Video Revision Requested - Order ${updatedOrder.orderNumber}`,
          html: `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #8b5cf6; margin: 0;">Kia Ora Kahi</h1>
              </div>
              
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px; text-align: center;">
                <h2 style="color: white; margin: 0 0 20px 0;">📝 Video Revision Requested</h2>
                <p style="color: white; margin: 0 0 25px 0;">Hello ${updatedOrder.celebrity.user.name}, the customer has requested a revision for your video.</p>
                <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;">
                  <p style="color: white; margin: 0 0 10px 0;"><strong>Order:</strong> ${updatedOrder.orderNumber}</p>
                  <p style="color: white; margin: 0 0 10px 0;"><strong>Customer:</strong> ${updatedOrder.user.name}</p>
                  <p style="color: white; margin: 0 0 10px 0;"><strong>For:</strong> ${updatedOrder.recipientName}</p>
                  <p style="color: white; margin: 0 0 10px 0;"><strong>Occasion:</strong> ${updatedOrder.occasion}</p>
                  <p style="color: white; margin: 0 0 10px 0;"><strong>Revision:</strong> ${updatedOrder.revisionCount} of ${updatedOrder.maxRevisions}</p>
                </div>
                <a href="${process.env.NEXTAUTH_URL}/celebrity-dashboard" style="display: inline-block; background: white; color: #f59e0b; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Request</a>
              </div>
              
              <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                <h3 style="color: #333; margin: 0 0 10px 0;">Customer Feedback:</h3>
                <p style="color: #666; margin: 0; background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b;">${declineReason}</p>
              </div>
              
              <div style="margin-top: 20px; text-align: center; color: #666;">
                <p>Please create a new video addressing the customer's feedback.</p>
                <p>You have ${updatedOrder.maxRevisions - updatedOrder.revisionCount} revision${updatedOrder.maxRevisions - updatedOrder.revisionCount !== 1 ? "s" : ""} remaining.</p>
                <p>Log in to your celebrity dashboard to upload the revised video.</p>
              </div>
            </div>
          `,
          text: `
            Kia Ora Kahi - Video Revision Requested
            
            Hello ${updatedOrder.celebrity.user.name},
            
            The customer has requested a revision for your video.
            
            Order: ${updatedOrder.orderNumber}
            Customer: ${updatedOrder.user.name}
            For: ${updatedOrder.recipientName}
            Occasion: ${updatedOrder.occasion}
            Revision: ${updatedOrder.revisionCount} of ${updatedOrder.maxRevisions}
            
            Customer Feedback:
            ${declineReason}
            
            Please create a new video addressing the customer's feedback.
            You have ${updatedOrder.maxRevisions - updatedOrder.revisionCount} revision${updatedOrder.maxRevisions - updatedOrder.revisionCount !== 1 ? "s" : ""} remaining.
            
            Log in to your celebrity dashboard: ${process.env.NEXTAUTH_URL}/celebrity-dashboard
          `,
        })
        console.log("✅ Decline notification email sent to celebrity")
      } catch (emailError) {
        console.error("❌ Failed to send decline notification email:", emailError)
        // Don't fail the API call if email fails
      }
    }

    // Send confirmation email to customer
    if (updatedOrder.user.email) {
      try {
        await sendEmail({
          to: updatedOrder.user.email,
          subject: `Revision Requested - Order ${updatedOrder.orderNumber}`,
          html: `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #8b5cf6; margin: 0;">Kia Ora Kahi</h1>
              </div>
              
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px; text-align: center;">
                <h2 style="color: white; margin: 0 0 20px 0;">📝 Revision Request Sent</h2>
                <p style="color: white; margin: 0 0 25px 0;">Hello ${updatedOrder.user.name}, your revision request has been sent to ${updatedOrder.celebrity.user.name}.</p>
                <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;">
                  <p style="color: white; margin: 0 0 10px 0;"><strong>Order:</strong> ${updatedOrder.orderNumber}</p>
                  <p style="color: white; margin: 0 0 10px 0;"><strong>Celebrity:</strong> ${updatedOrder.celebrity.user.name}</p>
                  <p style="color: white; margin: 0 0 10px 0;"><strong>Revision:</strong> ${updatedOrder.revisionCount} of ${updatedOrder.maxRevisions}</p>
                  <p style="color: white; margin: 0 0 10px 0;"><strong>Status:</strong> Revision in Progress</p>
                </div>
                <a href="${process.env.NEXTAUTH_URL}/orders/${updatedOrder.orderNumber}" style="display: inline-block; background: white; color: #3b82f6; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Track Order</a>
              </div>
              
              <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                <h3 style="color: #333; margin: 0 0 10px 0;">Your Feedback:</h3>
                <p style="color: #666; margin: 0; background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #3b82f6;">${declineReason}</p>
              </div>
              
              <div style="margin-top: 20px; text-align: center; color: #666;">
                <p>The celebrity will work on addressing your feedback and upload a revised video.</p>
                <p>You'll receive an email notification when the new video is ready for review.</p>
                <p>Remaining revisions: ${updatedOrder.maxRevisions - updatedOrder.revisionCount}</p>
              </div>
            </div>
          `,
          text: `
            Kia Ora Kahi - Revision Request Sent
            
            Hello ${updatedOrder.user.name},
            
            Your revision request has been sent to ${updatedOrder.celebrity.user.name}.
            
            Order: ${updatedOrder.orderNumber}
            Celebrity: ${updatedOrder.celebrity.user.name}
            Revision: ${updatedOrder.revisionCount} of ${updatedOrder.maxRevisions}
            Status: Revision in Progress
            
            Your Feedback:
            ${declineReason}
            
            The celebrity will work on addressing your feedback and upload a revised video.
            You'll receive an email notification when the new video is ready for review.
            Remaining revisions: ${updatedOrder.maxRevisions - updatedOrder.revisionCount}
            
            Track your order: ${process.env.NEXTAUTH_URL}/orders/${updatedOrder.orderNumber}
          `,
        })
        console.log("✅ Decline confirmation email sent to customer")
      } catch (emailError) {
        console.error("❌ Failed to send decline confirmation email:", emailError)
        // Don't fail the API call if email fails
      }
    }

    console.log("✅ Video decline processed successfully")

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Video declined successfully. Revision request sent to celebrity.",
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        approvalStatus: updatedOrder.approvalStatus,
        revisionCount: updatedOrder.revisionCount,
        maxRevisions: updatedOrder.maxRevisions,
        declinedAt: updatedOrder.declinedAt,
        declineReason: updatedOrder.declineReason,
      },
    })
  } catch (error) {
    console.error("❌ Error processing video decline:", error)
    return NextResponse.json(
      {
        error: "Failed to process video decline",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}