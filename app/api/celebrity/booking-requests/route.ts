import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log("❌ Celebrity Booking Requests API - No session or user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get celebrity profile
    const celebrity = await prisma.celebrity.findUnique({
      where: { userId: session.user.id },
    });

    if (!celebrity) {
      console.log(
        "❌ Celebrity profile not found for userId:",
        session.user.id
      );
      return NextResponse.json(
        { error: "Celebrity profile not found" },
        { status: 404 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const offset = Number.parseInt(searchParams.get("offset") || "0");

    // First, get all orders for this celebrity that should have bookings
    const ordersForCelebrity = await prisma.order.findMany({
      where: {
        celebrityId: celebrity.id,
        OR: [
          {
            status: {
              in: [
                "PENDING",
                "CONFIRMED",
                "IN_PROGRESS",
                "COMPLETED",
                "REVISION_REQUESTED",
                "PENDING_APPROVAL",
              ],
            },
          },
          {
            approvalStatus: "DECLINED", // Include declined orders regardless of status
          },
        ],
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
        items: {
          select: {
            type: true,
            metadata: true,
            totalPrice: true,
          },
        },
        // Include all tips to allow computing latest message even if pending
        tips: {
          select: {
            id: true,
            amount: true,
            message: true,
            paymentStatus: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Filter orders that have booking records (skip those without bookings for now)
    const ordersWithBookings = ordersForCelebrity.filter(
      (order) => order.booking
    );

    // Log any orders without bookings for debugging
    const ordersWithoutBookings = ordersForCelebrity.filter(
      (order) => !order.booking
    );
    if (ordersWithoutBookings.length > 0) {
      console.log(
        `⚠️ Found ${ordersWithoutBookings.length} orders without booking records:`,
        ordersWithoutBookings.map((o) => o.orderNumber)
      );
    }

    // Filter by status and apply pagination
    const filteredOrders = ordersWithBookings.filter((order) => {
      if (status === "ALL") return true;
      return order.booking.status === status;
    });

    const bookingRequests = filteredOrders.slice(offset, offset + limit);

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
        approvalStatus: booking.order?.approvalStatus,
      })),
    });

    // Get total count for pagination (use the filtered orders)
    const totalCount = filteredOrders.length;

    console.log("📊 Total booking requests count:", totalCount);

    // Format the response data including tip information
    const formattedRequests = bookingRequests.map((orderWithBooking) => {
      const booking = orderWithBooking.booking;
      const order = orderWithBooking;

      // Calculate total tips for this booking
      // Tips are stored as dollars in the database, so no conversion needed
      // Include tip from initial booking order items and any successful post-booking tips
      const succeededTips = (order.tips || []).filter(
        (tip: any) => tip.paymentStatus === "SUCCEEDED"
      );
      const tipFromSucceededRecords =
        succeededTips.reduce((sum: number, tip: any) => sum + tip.amount, 0) || 0;
      const tipFromOrderItems = (order.items || [])
        .filter((it: any) => it.type === "tip")
        .reduce((sum: number, it: any) => sum + (Number(it.totalPrice) || 0), 0);
      const totalTips = tipFromOrderItems + tipFromSucceededRecords;

      // Extract tipMessage from initial tip order item metadata (if present)
      let tipMessageFromItem: string | undefined = undefined;
      try {
        const tipItem = (order.items || []).find((it: any) => it.type === "tip" && it.metadata);
        if (tipItem) {
          const md = typeof tipItem.metadata === "string" ? JSON.parse(tipItem.metadata) : tipItem.metadata;
          tipMessageFromItem = md?.tipMessage || md?.message || undefined;
        }
      } catch (err) {
        console.log("⚠️ Failed to parse tip item metadata", err);
      }

      // Fallback: use the most recent tip's message if available (any status)
      const latestTipMessage = (order.tips || [])
        .slice()
        .reverse()
        .find((t: any) => t.message)?.message || undefined;

      console.log(`💰 Booking ${booking.id} tip calculation:`, {
        tipCount: order.tips?.length || 0,
        individualTips: order.tips?.map((tip) => tip.amount) || [],
        tipFromOrderItems,
        tipFromSucceededRecords,
        totalTips,
        note: "Tips include booking-time tip from order items + successful tip payments",
      });

      const GST_RATE = 0.15;
      const OTHER_FEES_RATE = 0.089;
      const TOTAL_FEES_RATE = GST_RATE + OTHER_FEES_RATE;

      const bookingAmount = order.totalAmount || 0;
      const baseAmount = Math.max(bookingAmount - totalTips, 0);
      const platformFees = Math.round(baseAmount * TOTAL_FEES_RATE);
      const amountAfterFees = Math.max(baseAmount - platformFees, 0);
      const sharePercent = celebrity.isVIP ? 0.8 : 0.7;
      const computedCelebrityAmount = Math.round(amountAfterFees * sharePercent);

      return {
        id: booking.id,
        orderNumber: order.orderNumber || `REQ-${booking.id.slice(-8)}`,
        customerName: order.user?.name || "Unknown Customer",
        customerEmail: order.user?.email || "",
        customerImage: order.user?.image || null,
        recipientName: booking.recipientName || "Unknown Recipient",
        occasion: booking.occasion || "General Request",
        instructions: booking.instructions || "",
        personalMessage: booking.message || "",
        specialInstructions: booking.specialInstructions || "",
        amount: bookingAmount,
        celebrityAmount: computedCelebrityAmount,
        tipAmount: totalTips,
        totalEarnings: computedCelebrityAmount + totalTips,
        requestedDate: booking.createdAt.toISOString(),
        status: booking.status.toLowerCase(),
        createdAt: booking.createdAt.toISOString(),
        deadline:
          booking.deadline?.toISOString() || (() => {
            let rush = false;
            try {
              const rushItem = (order.items || []).find((it: any) => {
                if (it.type !== "addon") return false;
                const md = typeof it.metadata === "string" ? JSON.parse(it.metadata) : it.metadata;
                return md?.addOnId === "rush";
              });
              rush = !!rushItem;
            } catch {}
            const created = new Date(booking.createdAt);
            const ms = rush ? 12 * 60 * 60 * 1000 : 3 * 24 * 60 * 60 * 1000;
            return new Date(created.getTime() + ms).toISOString();
          })(),
        paymentStatus: order.paymentStatus || "PENDING",
        approvalStatus:
          order.approvalStatus?.toLowerCase() || "pending_approval",
        approvedAt: order.approvedAt?.toISOString(),
        videoUrl: order.videoUrl || "",
        declineReason: order.declineReason || "",
        declinedAt: order.declinedAt?.toISOString(),
        revisionCount: order.revisionCount,
        tipMessage: tipMessageFromItem ?? latestTipMessage,
        // Only expose succeeded tips in the list shown to celebrity
        tips:
          succeededTips.map((tip: any) => ({
            id: tip.id,
            amount: tip.amount,
            message: tip.message,
            createdAt: tip.createdAt.toISOString(),
          })),
      };
    });

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
    });

    const response = {
      requests: formattedRequests,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    };

    console.log("📤 Final API response:", response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Error fetching celebrity booking requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking requests" },
      { status: 500 }
    );
  }
}
