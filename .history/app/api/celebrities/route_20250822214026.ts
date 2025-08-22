import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Database-only celebrities API - no mock data

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")
    const sortBy = searchParams.get("sortBy")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const availability = searchParams.get("availability")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    console.log("API received params:", { category, search, featured, sortBy, minPrice, maxPrice, availability, page, limit })

    // Only use database data - no mock data
    let celebrities: any[] = []
    let total = 0

    try {
      // Build where clause for database
      const where: any = {
        isActive: true,
      }

      // Category filter
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
          {
            tags: {
              hasSome: [search.trim()],
            },
          },
        ]
      }

      // Price range filter
      if (minPrice || maxPrice) {
        where.price = {
          ...(minPrice && { gte: Number(minPrice) }),
          ...(maxPrice && { lte: Number(maxPrice) }),
        }
      }

      // Availability filter
      if (availability && availability !== "All") {
        const now = new Date()
        const thisWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        const nextWeek = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

        switch (availability) {
          case "Available Now":
            where.nextAvailable = {
              lte: now.toISOString().split('T')[0],
            }
            break
          case "Available This Week":
            where.nextAvailable = {
              lte: thisWeek.toISOString().split('T')[0],
            }
            break
          case "Available Next Week":
            where.nextAvailable = {
              lte: nextWeek.toISOString().split('T')[0],
            }
            break
        }
      }

      // Featured filter
      if (featured === "true") {
        where.featured = true
      }

      // Build orderBy clause
      let orderBy: any = [{ featured: "desc" }, { averageRating: "desc" }, { totalReviews: "desc" }]

      if (sortBy) {
        switch (sortBy) {
          case "Price: Low to High":
            orderBy = [{ price: "asc" }]
            break
          case "Price: High to Low":
            orderBy = [{ price: "desc" }]
            break
          case "Rating":
            orderBy = [{ averageRating: "desc" }, { totalReviews: "desc" }]
            break
          case "Response Time":
            orderBy = [{ responseTime: "asc" }]
            break
          case "Most Popular":
            orderBy = [{ totalReviews: "desc" }, { averageRating: "desc" }]
            break
          case "Featured":
          default:
            orderBy = [{ featured: "desc" }, { averageRating: "desc" }, { totalReviews: "desc" }]
            break
        }
      }

      // Fetch from database
      const [dbCelebrities, dbTotal] = await Promise.all([
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

      // Use database results only
      celebrities = dbCelebrities.map((celebrity) => ({
        id: celebrity.id,
        name: celebrity.user.name || "Celebrity",
        image: celebrity.user.image || "/placeholder.svg?height=400&width=400",
        category: celebrity.category || "Entertainment",
        bio: celebrity.bio || "Professional celebrity",
        price: celebrity.price || 299,
        pricePersonal: celebrity.price || 299,
        priceBusiness: celebrity.price || 599,
        priceCharity: celebrity.price || 199,
        rating: celebrity.averageRating || celebrity.rating || 4.5,
        reviewCount: celebrity._count.reviews || 0,
        responseTime: celebrity.responseTime || "24 hours",
        completedVideos: celebrity.completionRate || 95,
        verified: celebrity.verified || false,
        featured: celebrity.featured || false,
        nextAvailable: celebrity.nextAvailable || "2024-01-15",
        tags: celebrity.tags || [],
      }))
      total = dbTotal
      console.log(`Using database results: ${celebrities.length} celebrities`)
    } catch (dbError: unknown) {
      console.log("Database error:", dbError instanceof Error ? dbError.message : String(dbError))
      return NextResponse.json({ error: "Failed to fetch celebrities from database" }, { status: 500 })
    }

    // Calculate pagination values
    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      celebrities,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
      useMockData: false,
    })
  } catch (error) {
    console.error("Error fetching celebrities:", error)
    return NextResponse.json({ error: "Failed to fetch celebrities" }, { status: 500 })
  }
}