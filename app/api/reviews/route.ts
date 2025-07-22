import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { celebrityId, bookingId, rating, comment, occasion, orderNumber } = await request.json()

    console.log("📝 Creating review:", {
      celebrityId,
      bookingId,
      orderNumber,
      rating,
      userId: session.user.id,
    })

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // If orderNumber is provided, check approval status
    if (orderNumber) {
      console.log("🔍 Checking approval status for order:", orderNumber)

      const order = await prisma.order.findUnique({
        where: { orderNumber },
        select: {
          id: true,
          userId: true,
          status: true,
          approvalStatus: true,
          approvedAt: true,
          celebrityId: true,
        },
      })

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }

      // Verify user owns the order
      if (order.userId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized - not your order" }, { status: 403 })
      }

      // Verify celebrity matches
      if (order.celebrityId !== celebrityId) {
        return NextResponse.json({ error: "Celebrity mismatch" }, { status: 400 })
      }

      // Check if video has been approved
      if (order.approvalStatus !== "APPROVED") {
        console.log("❌ Review blocked - video not approved:", {
          orderNumber,
          approvalStatus: order.approvalStatus,
          orderStatus: order.status,
        })

        let errorMessage = "You can only review after approving the video."

        switch (order.approvalStatus) {
          case "PENDING_APPROVAL":
            errorMessage = "Please review and approve the video before leaving a review."
            break
          case "DECLINED":
            errorMessage = "Video is being revised. You can leave a review after approving the new version."
            break
          case "REVISION_REQUESTED":
            errorMessage = "Celebrity is working on revisions. You can leave a review after approving the video."
            break
        }

        return NextResponse.json(
          {
            error: errorMessage,
            approvalRequired: true,
            currentStatus: order.approvalStatus,
          },
          { status: 400 },
        )
      }

      console.log("✅ Video approved - review allowed:", {
        orderNumber,
        approvedAt: order.approvedAt,
      })
    }

    // Check if user has already reviewed this booking
    if (bookingId) {
      const existingReview = await prisma.review.findFirst({
        where: {
          userId: session.user.id,
          bookingId: bookingId,
        },
      })

      if (existingReview) {
        return NextResponse.json({ error: "You have already reviewed this booking" }, { status: 400 })
      }
    }

    // Verify celebrity exists
    const celebrity = await prisma.celebrity.findUnique({
      where: { id: celebrityId },
    })

    if (!celebrity) {
      return NextResponse.json({ error: "Celebrity not found" }, { status: 404 })
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        celebrityId,
        bookingId: bookingId || null,
        rating,
        comment: comment || null,
        occasion: occasion || null,
        verified: bookingId ? true : false, // Verified if it's from a booking
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    })

    console.log("✅ Review created successfully:", review.id)

    // Update celebrity's average rating
    const allReviews = await prisma.review.findMany({
      where: { celebrityId },
      select: { rating: true },
    })

    const averageRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
    const totalReviews = allReviews.length

    await prisma.celebrity.update({
      where: { id: celebrityId },
      data: {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        totalReviews,
      },
    })

    console.log("✅ Celebrity rating updated:", {
      celebrityId,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
    })

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        occasion: review.occasion,
        verified: review.verified,
        createdAt: review.createdAt.toISOString(),
        user: {
          name: review.user.name || "Anonymous",
          image: review.user.image,
        },
      },
    })
  } catch (error) {
    console.error("❌ Error creating review:", error)
    return NextResponse.json(
      {
        error: "Failed to create review",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const celebrityId = searchParams.get("celebrityId")
    const orderNumber = searchParams.get("orderNumber")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    if (!celebrityId) {
      return NextResponse.json({ error: "Celebrity ID is required" }, { status: 400 })
    }

    // If orderNumber is provided, check if user can review (approval status)
    if (orderNumber) {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        const order = await prisma.order.findUnique({
          where: { orderNumber },
          select: {
            id: true,
            userId: true,
            status: true,
            approvalStatus: true,
            approvedAt: true,
            celebrityId: true,
          },
        })

        if (order && order.userId === session.user.id && order.celebrityId === celebrityId) {
          const canReview = order.approvalStatus === "APPROVED"

          return NextResponse.json({
            canReview,
            approvalStatus: order.approvalStatus,
            orderStatus: order.status,
            approvedAt: order.approvedAt,
            message: canReview
              ? "You can leave a review for this order"
              : "Video must be approved before leaving a review",
          })
        }
      }
    }

    const reviews = await prisma.review.findMany({
      where: { celebrityId },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    })

    const totalReviews = await prisma.review.count({
      where: { celebrityId },
    })

    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      user: review.user.name || "Anonymous",
      userImage: review.user.image,
      rating: review.rating,
      date: review.createdAt.toLocaleDateString(),
      comment: review.comment || "",
      verified: review.verified,
      occasion: review.occasion || "General",
    }))

    return NextResponse.json({
      reviews: formattedReviews,
      total: totalReviews,
      hasMore: offset + limit < totalReviews,
    })
  } catch (error) {
    console.error("❌ Error fetching reviews:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch reviews",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}