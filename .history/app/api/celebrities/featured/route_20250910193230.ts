import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "6")

    console.log("Fetching featured celebrities with limit:", limit)

    // Fetch top-rated featured celebrities from database
    const featuredCelebrities = await prisma.celebrity.findMany({
      where: {
        isActive: true,
        featured: true, // Only get featured celebrities
        // Exclude test celebrities from frontend
        user: {
          email: {
            notIn: ['testcelb@example.com', 'brity@gmail.com']
          }
        }
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            bookings: true,
          },
        },
      },
      orderBy: [
        { featured: "desc" }, // Featured first
        { averageRating: "desc" }, // Then by rating
        { totalReviews: "desc" }, // Then by review count
        { createdAt: "desc" }, // Then by newest
      ],
      take: limit,
    })

    // Format the response
    const formattedCelebrities = featuredCelebrities.map((celebrity) => {
      // Calculate average rating from reviews
      const reviews = celebrity.reviews
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : celebrity.averageRating || 4.5

      return {
        id: celebrity.id,
        name: celebrity.user.name || "Celebrity",
        image: celebrity.user.image || "/placeholder.svg?height=400&width=400",
        category: celebrity.category || "Entertainment",
        rating: Number(averageRating.toFixed(1)),
        reviewCount: celebrity._count.reviews || 0,
        bookingCount: celebrity._count.bookings || 0,
        price: celebrity.price || 299,
        verified: celebrity.verified || false,
        featured: celebrity.featured || false,
        bio: celebrity.bio || "Professional celebrity",
        responseTime: celebrity.responseTime || "24 hours",
        completionRate: celebrity.completionRate || 95,
        nextAvailable: celebrity.nextAvailable || "2024-01-15",
        tags: celebrity.tags || [],
      }
    })

    console.log(`Found ${formattedCelebrities.length} featured celebrities`)

    return NextResponse.json({
      celebrities: formattedCelebrities,
      total: formattedCelebrities.length,
      limit,
    })
  } catch (error) {
    console.error("Error fetching featured celebrities:", error)
    return NextResponse.json({ error: "Failed to fetch featured celebrities" }, { status: 500 })
  }
}
