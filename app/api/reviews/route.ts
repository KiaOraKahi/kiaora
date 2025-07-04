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

    const { celebrityId, bookingId, rating, comment, occasion } = await request.json()

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
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
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const celebrityId = searchParams.get("celebrityId")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    if (!celebrityId) {
      return NextResponse.json({ error: "Celebrity ID is required" }, { status: 400 })
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
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}