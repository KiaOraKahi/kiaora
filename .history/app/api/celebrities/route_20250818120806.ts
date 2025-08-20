import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")
    const sortBy = searchParams.get("sortBy")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    console.log("API received params:", { category, search, featured, sortBy, page, limit })

    // Build where clause
    const where: any = {
      isActive: true,
    }

    // Category filter - use contains for more flexible matching
    if (category && category !== "all" && category !== "All") {
      where.category = {
        contains: category,
        mode: "insensitive",
      }
    }

    // Search filter
    if (search && search.trim()) {
      where.OR = [
        {
          user: {
            name: {
              contains: search.trim(),
              mode: "insensitive",
            },
          },
        },
        {
          category: {
            contains: search.trim(),
            mode: "insensitive",
          },
        },
        {
          bio: {
            contains: search.trim(),
            mode: "insensitive",
          },
        },
      ]
    }

    // Featured filter
    if (featured === "true") {
      where.featured = true
    }

    // Build orderBy clause based on sortBy parameter
    let orderBy: any = [{ featured: "desc" }, { averageRating: "desc" }, { totalReviews: "desc" }]

    if (sortBy) {
      switch (sortBy) {
        case "Price: Low to High":
          orderBy = [{ pricePersonal: "asc" }, { price: "asc" }]
          break
        case "Price: High to Low":
          orderBy = [{ pricePersonal: "desc" }, { price: "desc" }]
          break
        case "Rating":
          orderBy = [{ averageRating: "desc" }, { totalReviews: "desc" }]
          break
        case "Response Time":
          // For response time, we'll sort by the text field - shorter times should come first
          orderBy = [{ responseTime: "asc" }]
          break
        case "Featured":
        default:
          orderBy = [{ featured: "desc" }, { averageRating: "desc" }, { totalReviews: "desc" }]
          break
      }
    }

    console.log("Database query:", { where, orderBy, skip, limit })

    // First, let's check what categories actually exist in the database
    const existingCategories = await prisma.celebrity.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ["category"],
    })
    console.log(
      "Existing categories in database:",
      existingCategories.map((c) => c.category),
    )

    // Get celebrities with user data
    const [celebrities, total] = await Promise.all([
      prisma.celebrity.findMany({
        where,
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
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.celebrity.count({ where }),
    ])

    console.log(`Found ${celebrities.length} celebrities out of ${total} total`)

    // If no results and we're filtering by category, let's try a broader search
    if (celebrities.length === 0 && category && category !== "All") {
      console.log(`No results for category "${category}", trying broader search...`)

      // Try with different category matching approaches
      const alternativeWhere = {
        isActive: true,
        OR: [
          {
            category: {
              contains: category,
              mode: "insensitive" as const,
            },
          },
          {
            category: {
              startsWith: category,
              mode: "insensitive" as const,
            },
          },
          {
            category: {
              endsWith: category,
              mode: "insensitive" as const,
            },
          },
        ],
      }

      const [altCelebrities, altTotal] = await Promise.all([
        prisma.celebrity.findMany({
          where: alternativeWhere,
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
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.celebrity.count({ where: alternativeWhere }),
      ])

      console.log(`Alternative search found ${altCelebrities.length} celebrities out of ${altTotal} total`)

      // Use alternative results if found
      if (altCelebrities.length > 0) {
        celebrities.splice(0, celebrities.length, ...altCelebrities)
        // Update total count
        const newTotal = altTotal
        console.log(`Using alternative results: ${celebrities.length} celebrities`)
      }
    }

    // Calculate pagination values
    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    // Format the response to match frontend expectations
    const formattedCelebrities = celebrities.map((celebrity) => ({
      id: celebrity.id,
      name: celebrity.user.name || "Celebrity",
      image: celebrity.user.image || "/placeholder.svg?height=400&width=400",
      category: celebrity.category || "Entertainment",
      bio: celebrity.bio || "Professional celebrity",
      price: celebrity.pricePersonal || celebrity.price || 299,
      pricePersonal: celebrity.pricePersonal || 299,
      priceBusiness: celebrity.priceBusiness || 599,
      priceCharity: celebrity.priceCharity || 199,
      rating: celebrity.averageRating || 4.5,
      reviewCount: celebrity._count.reviews || 0,
      responseTime: celebrity.responseTime || "24 hours",
      completedVideos: celebrity.completionRate || 95,
      verified: celebrity.verified || false,
      featured: celebrity.featured || false,
      nextAvailable: celebrity.nextAvailable || "2024-01-15",
      tags: celebrity.tags || [],
      availability: "Available", // Add missing availability field
    }))

    return NextResponse.json({
      celebrities: formattedCelebrities,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev, 
      },
    })
  } catch (error) {
    console.error("Error fetching celebrities:", error)
    return NextResponse.json({ error: "Failed to fetch celebrities" }, { status: 500 })
  }
}