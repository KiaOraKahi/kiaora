import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ensureBookingRecord } from "@/lib/booking-utils"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      console.log("❌ Celebrity Booking Requests API - No session or user ID")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get celebrity profile
    const celebrity = await prisma.celebrity.findUnique({
      where: { userId: session.user.id },
    })

    if (!celebrity) {
      console.log("❌ Celebrity profile not found for userId:", session.user.id)
      return NextResponse.json({ error: "Celebrity profile not found" }, { status: 404 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "PENDING"
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Fetch booking requests with related data including tips through order
    const bookingRequests = await prisma.booking.findMany({
      where: {
        celebrityId: celebrity.id,
        ...(status !== "ALL" && { status: status as any }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            celebrityAmount: true,
            paymentStatus: true,
            createdAt: true,
            approvalStatus: true,
            approvedAt: true,
            videoUrl: true,
            declineReason: true,
            declinedAt: true,
            revisionCount: true,
            tips: {
              where: {
                paymentStatus: "SUCCEEDED", 
              },
              select: {
                id: true,
                amount: true,
                message: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    })

    console.log("📋 Raw booking requests fetched:", {
      count: bookingRequests.length,
      bookings: bookingRequests.map((booking) => ({
        id: booking.id,
        status: booking.status,
        customerName: booking.user?.name,
        orderNumber: booking.order?.orderNumber,
        amount: booking.order?.totalAmount,
        celebrityAmount: booking.order?.celebrityAmount,
        tips: booking.order?.tips?.length || 0,
        tipAmounts: booking.order?.tips?.map((tip) => tip.amount) || [],
        createdAt: booking.createdAt,
        approvalStatus: booking.order?.approvalStatus
      })),
    })

    // Get total count for pagination
    const totalCount = await prisma.booking.count({
      where: {
        celebrityId: celebrity.id,
        ...(status !== "ALL" && { status: status as any }),
      },
    })

    console.log("📊 Total booking requests count:", totalCount)

    // Format the response data including tip information
    const formattedRequests = bookingRequests.map((booking) => {
      // Calculate total tips for this booking
      // Tips are stored as dollars in the database, so no conversion needed
      const totalTips = booking.order?.tips?.reduce((sum: number, tip: any) => sum + tip.amount, 0) || 0

      console.log(`💰 Booking ${booking.id} tip calculation:`, {
        tipCount: booking.order?.tips?.length || 0,
        individualTips: booking.order?.tips?.map((tip) => tip.amount) || [],
        totalTips,
        note: "Tips stored as dollars in database, no conversion applied",
      })

      return {
        id: booking.id,
        orderNumber: booking.order?.orderNumber || `REQ-${booking.id.slice(-8)}`,
        customerName: booking.user?.name || "Unknown Customer",
        customerEmail: booking.user?.email || "",
        customerImage: booking.user?.image || null,
        recipientName: booking.recipientName || "Unknown Recipient",
        occasion: booking.occasion || "General Request",
        instructions: booking.instructions || "",
        amount: booking.order?.totalAmount || 0,
        celebrityAmount: booking.order?.celebrityAmount || 0,
        tipAmount: totalTips,
        totalEarnings: (booking.order?.celebrityAmount || 0) + totalTips,
        requestedDate: booking.createdAt.toISOString(),
        status: booking.status.toLowerCase(),
        createdAt: booking.createdAt.toISOString(),
        deadline: booking.deadline?.toISOString() || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        paymentStatus: booking.order?.paymentStatus || "PENDING",
        approvalStatus: booking.order?.approvalStatus.toLowerCase(),
        approvedAt: booking.order?.approvedAt?.toISOString(),
        videoUrl: booking.order?.videoUrl || "",
        declineReason: booking.order?.declineReason || "",
        declinedAt: booking.order?.declinedAt?.toISOString(),
        revisionCount: booking.order?.revisionCount,
        tips:
          booking.order?.tips?.map((tip: any) => ({
            id: tip.id,
            amount: tip.amount,
            message: tip.message,
            createdAt: tip.createdAt.toISOString(),
          })) || [],
      }
    })

    console.log("✅ Formatted booking requests:", {
      count: formattedRequests.length,
      requests: formattedRequests.map((r) => ({
        id: r.id,
        orderNumber: r.orderNumber,
        amount: r.amount,
        celebrityAmount: r.celebrityAmount,
        tipAmount: r.tipAmount,
        totalEarnings: r.totalEarnings,
        tipDetails: r.tips,
      })),
    })

    const response = {
      requests: formattedRequests,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    }

    console.log("📤 Final API response:", response)

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Error fetching celebrity booking requests:", error)
    return NextResponse.json({ error: "Failed to fetch booking requests" }, { status: 500 })
  }
}
