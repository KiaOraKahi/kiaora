import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "CELEBRITY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action } = await request.json()
    const requestId = params.id

    if (!["accept", "decline"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Here you would update the booking request in the database
    // For now, we'll just return a success response

    const updatedStatus = action === "accept" ? "accepted" : "declined"

    // Mock response - replace with actual database update
    const updatedRequest = {
      id: requestId,
      status: updatedStatus,
      updatedAt: new Date().toISOString(),
    }

    // If accepted, you might also want to:
    // 1. Send notification to customer
    // 2. Create calendar event
    // 3. Update celebrity's availability
    // 4. Send confirmation email

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: `Booking request ${action}ed successfully`,
    })
  } catch (error) {
    console.error("Error updating booking request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}