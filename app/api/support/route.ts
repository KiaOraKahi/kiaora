import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendSupportRequestEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, category, subject, message, priority } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, subject, message" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate message length
    if (message.length < 10) {
      return NextResponse.json({ error: "Message must be at least 10 characters long" }, { status: 400 })
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: "Message must be less than 2000 characters" }, { status: 400 })
    }

    // Validate priority
    const validPriorities = ["low", "normal", "high", "urgent"]
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json({ error: "Invalid priority level" }, { status: 400 })
    }

    // Create support ticket in database
    const supportTicket = await prisma.supportTicket.create({
      data: {
        name,
        email,
        phone: phone || null,
        category: category || "general",
        subject,
        message,
        priority: priority || "normal",
        status: "OPEN",
        ticketNumber: generateTicketNumber(),
      },
    })

    console.log("✅ Support ticket created:", supportTicket.ticketNumber)

    // Send confirmation email to user
    try {
      await sendSupportRequestEmail(
        email,
        name,
        supportTicket.ticketNumber,
        subject,
        category || "general"
      )
    } catch (emailError) {
      console.error("❌ Failed to send support confirmation email:", emailError)
      // Don't fail the request if email fails
    }

    // Send notification to support team
    try {
      await sendSupportTeamNotification(supportTicket)
    } catch (notificationError) {
      console.error("❌ Failed to send support team notification:", notificationError)
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      success: true,
      message: "Support request submitted successfully! We'll get back to you within 24 hours.",
      ticketNumber: supportTicket.ticketNumber,
    })
  } catch (error) {
    console.error("❌ Support request error:", error)
    return NextResponse.json(
      { error: "Failed to submit support request. Please try again." },
      { status: 500 }
    )
  }
}

// GET /api/support - Get support ticket status (for authenticated users)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ticketNumber = searchParams.get("ticketNumber")
    const email = searchParams.get("email")

    if (!ticketNumber || !email) {
      return NextResponse.json(
        { error: "Ticket number and email are required" },
        { status: 400 }
      )
    }

    const ticket = await prisma.supportTicket.findFirst({
      where: {
        ticketNumber,
        email,
      },
      select: {
        id: true,
        ticketNumber: true,
        subject: true,
        status: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        responses: {
          select: {
            id: true,
            message: true,
            isFromSupport: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    })

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error("❌ Get support ticket error:", error)
    return NextResponse.json(
      { error: "Failed to retrieve ticket information" },
      { status: 500 }
    )
  }
}

function generateTicketNumber(): string {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `TKT-${timestamp}-${random}`
}

async function sendSupportTeamNotification(ticket: any) {
  // This would integrate with your email service to notify the support team
  // For now, we'll just log it
  console.log("📧 Support team notification for ticket:", ticket.ticketNumber)
  console.log("   - Priority:", ticket.priority)
  console.log("   - Category:", ticket.category)
  console.log("   - Subject:", ticket.subject)
}
