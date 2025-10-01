import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    // First, get all orders for this celebrity that should have bookings
    const ordersForCelebrity = await prisma.order.findMany({
      where: {
        celebrityId: celebrity.id,
        OR: [
          {
            status: {
              in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'REVISION_REQUESTED','PENDING_APPROVAL']
            }
          },
          {
            approvalStatus: 'DECLINED'  // Include declined orders regardless of status
          }
        ]
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
        booking: true,
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
      orderBy: {
        createdAt: "desc",
      },
    })

    // Filter orders that have booking records (skip those without bookings for now)
    const ordersWithBookings = ordersForCelebrity.filter(order => order.booking)
    
    // Log any orders without bookings for debugging
    const ordersWithoutBookings = ordersForCelebrity.filter(order => !order.booking)
    if (ordersWithoutBookings.length > 0) {
      console.log(`⚠️ Found ${ordersWithoutBookings.length} orders without booking records:`, 
        ordersWithoutBookings.map(o => o.orderNumber))
    }

    // Filter by status and apply pagination
    const filteredOrders = ordersWithBookings.filter(order => {
      if (status === "ALL") return true
      return order.booking.status === status
    })

    const bookingRequests = filteredOrders.slice(offset, offset + limit)

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

    // Get total count for pagination (use the filtered orders)
    const totalCount = filteredOrders.length

    console.log("📊 Total booking requests count:", totalCount)

    // Format the response data including tip information
    const formattedRequests = bookingRequests.map((orderWithBooking) => {
      const booking = orderWithBooking.booking
      const order = orderWithBooking
      
      // Calculate total tips for this booking
      // Tips are stored as dollars in the database, so no conversion needed
      const totalTips = order.tips?.reduce((sum: number, tip: any) => sum + tip.amount, 0) || 0

      console.log(`💰 Booking ${booking.id} tip calculation:`, {
        tipCount: order.tips?.length || 0,
        individualTips: order.tips?.map((tip) => tip.amount) || [],
        totalTips,
        note: "Tips stored as dollars in database, no conversion applied",
      })

      return {
        id: booking.id,
        orderNumber: order.orderNumber || `REQ-${booking.id.slice(-8)}`,
        customerName: order.user?.name || "Unknown Customer",
        customerEmail: order.user?.email || "",
        customerImage: order.user?.image || null,
        recipientName: booking.recipientName || "Unknown Recipient",
        occasion: booking.occasion || "General Request",
        instructions: booking.instructions || "",
        amount: order.totalAmount || 0,
        celebrityAmount: order.celebrityAmount || 0,
        tipAmount: totalTips,
        totalEarnings: (order.celebrityAmount || 0) + totalTips,
        requestedDate: booking.createdAt.toISOString(),
        status: booking.status.toLowerCase(),
        createdAt: booking.createdAt.toISOString(),
        deadline: booking.deadline?.toISOString() || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        paymentStatus: order.paymentStatus || "PENDING",
        approvalStatus: order.approvalStatus?.toLowerCase() || "pending_approval",
        approvedAt: order.approvedAt?.toISOString(),
        videoUrl: order.videoUrl || "",
        declineReason: order.declineReason || "",
        declinedAt: order.declinedAt?.toISOString(),
        revisionCount: order.revisionCount,
        tips:
          order.tips?.map((tip: any) => ({
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
