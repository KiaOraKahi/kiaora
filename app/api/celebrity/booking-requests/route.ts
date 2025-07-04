import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    console.log("🔍 Celebrity Booking Requests API - Session:", {
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.role,
      userName: session?.user?.name,
    })

    if (!session?.user?.id) {
      console.log("❌ Celebrity Booking Requests API - No session or user ID")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get celebrity profile
    console.log("🔍 Looking for celebrity profile with userId:", session.user.id)
    const celebrity = await prisma.celebrity.findUnique({
      where: { userId: session.user.id },
    })

    console.log("🔍 Celebrity profile found:", {
      celebrityId: celebrity?.id,
      // celebrityName: celebrity?.name,
      // celebritySlug: celebrity?.slug,
      celebrityUserId: celebrity?.userId,
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

    console.log("🔍 Query parameters:", { status, limit, offset })
    console.log("🔍 Fetching booking requests for celebrity ID:", celebrity.id)

    // Fetch booking requests with related data
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
            paymentStatus: true,
            createdAt: true,
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
        createdAt: booking.createdAt,
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

    // Format the response data
    const formattedRequests = bookingRequests.map((booking) => ({
      id: booking.id,
      orderNumber: booking.order?.orderNumber || `REQ-${booking.id.slice(-8)}`,
      customerName: booking.user?.name || "Unknown Customer",
      customerEmail: booking.user?.email || "",
      customerImage: booking.user?.image || null,
      recipientName: booking.recipientName || "Unknown Recipient",
      occasion: booking.occasion || "General Request",
      instructions: booking.instructions || "",
      amount: booking.order?.totalAmount || 0,
      requestedDate: booking.requestedDate?.toISOString() || new Date().toISOString(),
      status: booking.status.toLowerCase(),
      createdAt: booking.createdAt.toISOString(),
      deadline: booking.deadline?.toISOString() || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now as default
      paymentStatus: booking.order?.paymentStatus || "PENDING",
    }))

    console.log("✅ Formatted booking requests:", {
      count: formattedRequests.length,
      requests: formattedRequests,
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
