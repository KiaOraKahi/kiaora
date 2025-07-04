import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get celebrity profile for this user
    const celebrity = await prisma.celebrity.findUnique({
      where: { userId: session.user.id },
    })

    if (!celebrity) {
      return NextResponse.json({ error: "Celebrity profile not found" }, { status: 404 })
    }

    // Get all reviews for this celebrity
    const reviews = await prisma.review.findMany({
      where: { celebrityId: celebrity.id },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        booking: {
          select: {
            occasion: true,
            orderNumber: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Format reviews
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment || "",
      verified: review.verified,
      occasion: review.occasion || review.booking?.occasion || "",
      createdAt: review.createdAt.toISOString(),
      user: {
        name: review.user?.name || "Anonymous",
        image: review.user?.image || null,
      },
      orderNumber: review.booking?.orderNumber || null,
    }))

    // Calculate stats
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews : 0
    const ratingDistribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    }

    return NextResponse.json({
      reviews: formattedReviews,
      stats: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching celebrity reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}