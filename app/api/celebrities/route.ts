import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isActive: true,
    }

    if (category && category !== "all") {
      where.category = {
        contains: category,
        mode: "insensitive",
      }
    }

    if (search) {
      where.OR = [
        {
          user: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          category: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          bio: {
            contains: search,
            mode: "insensitive",
          },
        },
      ]
    }

    if (featured === "true") {
      where.featured = true
    }

    // Get celebrities with user data
    const [celebrities, total] = await Promise.all([
      prisma.celebrity.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              image: true, // This will contain the uploaded profile photo
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
            },
          },
        },
        orderBy: [{ featured: "desc" }, { averageRating: "desc" }, { totalReviews: "desc" }],
        skip,
        take: limit,
      }),
      prisma.celebrity.count({ where }),
    ])

    // Format the response
    const formattedCelebrities = celebrities.map((celebrity) => ({
      id: celebrity.id,
      name: celebrity.user.name || "Celebrity",
      image: celebrity.user.image || "/placeholder.svg?height=400&width=400", // 🎯 Use user's uploaded image
      category: celebrity.category || "Entertainment",
      bio: celebrity.bio || "Professional celebrity",
      price: celebrity.pricePersonal || celebrity.price || 299,
      pricePersonal: celebrity.pricePersonal || 299,
      priceBusiness: celebrity.priceBusiness || 599,
      priceCharity: celebrity.priceCharity || 199,
      rating: celebrity.averageRating || 4.5,
      totalReviews: celebrity._count.reviews || 0,
      responseTime: celebrity.responseTime || "24 hours",
      completionRate: celebrity.completionRate || 95,
      verified: celebrity.verified || false,
      featured: celebrity.featured || false,
      nextAvailable: celebrity.nextAvailable || "2024-01-15",
      tags: celebrity.tags || [],
    }))

    return NextResponse.json({
      celebrities: formattedCelebrities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching celebrities:", error)
    return NextResponse.json({ error: "Failed to fetch celebrities" }, { status: 500 })
  }
}
