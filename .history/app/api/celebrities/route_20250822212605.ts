import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Mock celebrity data for testing when database is unavailable
const mockCelebrities = [
  {
    id: "1",
    name: "Emma Stone",
    image: "/celeb1.jpg",
    category: "Actor",
    bio: "Academy Award-winning actress known for her versatile performances in comedy and drama. Perfect for personalized birthday messages and special occasions.",
    price: 299,
    rating: 4.9,
    reviewCount: 127,
    responseTime: "24 hours",
    completedVideos: 89,
    verified: true,
    featured: true,
    nextAvailable: "2024-01-15",
    tags: ["Hollywood", "Award Winner", "Comedy", "Drama"]
  },
  {
    id: "2",
    name: "Sarah",
    image: "/celeb2.jpg",
    category: "Musician",
    bio: "Grammy-winning singer-songwriter and pianist. Creates heartfelt, soulful video messages perfect for romantic occasions and celebrations.",
    price: 599,
    rating: 5.0,
    reviewCount: 203,
    responseTime: "48 hours",
    completedVideos: 156,
    verified: true,
    featured: true,
    nextAvailable: "2024-01-16",
    tags: ["Grammy Winner", "Soul", "Piano", "Romantic"]
  },
  {
    id: "3",
    name: "Tony Robbins",
    image: "/celeb3.jpg",
    category: "Motivator",
    bio: "World-renowned life coach and motivational speaker. Inspires with powerful messages for business success and personal development.",
    price: 899,
    rating: 4.8,
    reviewCount: 89,
    responseTime: "72 hours",
    completedVideos: 67,
    verified: true,
    featured: true,
    nextAvailable: "2024-01-20",
    tags: ["Motivation", "Business", "Leadership", "Success"]
  },
  {
    id: "4",
    name: "MrBeast",
    image: "/talents/1.jpeg",
    category: "Influencer",
    bio: "YouTube sensation and philanthropist. Creates energetic, fun video messages perfect for younger audiences and special events.",
    price: 1299,
    rating: 4.9,
    reviewCount: 445,
    responseTime: "1 week",
    completedVideos: 234,
    verified: true,
    featured: true,
    nextAvailable: "2024-01-25",
    tags: ["YouTube", "Philanthropy", "Entertainment", "Gaming"]
  },
  {
    id: "5",
    name: "Oprah Winfrey",
    image: "/talents/2.jpg",
    category: "Motivator",
    bio: "Media mogul and inspirational speaker. Delivers powerful, meaningful messages for life milestones and personal growth.",
    price: 1999,
    rating: 5.0,
    reviewCount: 78,
    responseTime: "2 weeks",
    completedVideos: 45,
    verified: true,
    featured: true,
    nextAvailable: "2024-02-01",
    tags: ["Media", "Inspiration", "Life Coach", "Empowerment"]
  },
  {
    id: "6",
    name: "Ryan Reynolds",
    image: "/talents/3.jpg",
    category: "Actor",
    bio: "Hollywood star known for his wit and charm. Perfect for humorous birthday messages and entertaining shoutouts.",
    price: 799,
    rating: 4.7,
    reviewCount: 156,
    responseTime: "48 hours",
    completedVideos: 123,
    verified: true,
    featured: false,
    nextAvailable: "2024-01-18",
    tags: ["Comedy", "Hollywood", "Wit", "Entertainment"]
  },
  {
    id: "7",
    name: "Taylor Swift",
    image: "/talents/4.jpg",
    category: "Musician",
    bio: "Global pop superstar and songwriter. Creates magical, personal video messages perfect for fans and special occasions.",
    price: 1499,
    rating: 4.9,
    reviewCount: 567,
    responseTime: "1 week",
    completedVideos: 289,
    verified: true,
    featured: true,
    nextAvailable: "2024-01-22",
    tags: ["Pop", "Songwriter", "Global Star", "Fan Favorite"]
  },
  {
    id: "8",
    name: "Dwayne Johnson",
    image: "/talents/5.jpg",
    category: "Actor",
    bio: "The Rock - action star and motivational figure. Delivers powerful, inspiring messages perfect for motivation and celebration.",
    price: 999,
    rating: 4.8,
    reviewCount: 234,
    responseTime: "72 hours",
    completedVideos: 178,
    verified: true,
    featured: false,
    nextAvailable: "2024-01-19",
    tags: ["Action", "Motivation", "Fitness", "Hollywood"]
  },
  {
    id: "9",
    name: "Ellen DeGeneres",
    image: "/talents/6.jpg",
    category: "Comedian",
    bio: "Beloved talk show host and comedian. Creates warm, funny video messages that bring joy and laughter.",
    price: 699,
    rating: 4.6,
    reviewCount: 189,
    responseTime: "1 week",
    completedVideos: 134,
    verified: true,
    featured: false,
    nextAvailable: "2024-01-24",
    tags: ["Comedy", "Talk Show", "Joy", "Entertainment"]
  },
  {
    id: "10",
    name: "LeBron James",
    image: "/celeb1.jpg",
    category: "Athlete",
    bio: "NBA superstar and philanthropist. Inspires with messages about teamwork, success, and achieving your dreams.",
    price: 1199,
    rating: 4.9,
    reviewCount: 312,
    responseTime: "1 week",
    completedVideos: 245,
    verified: true,
    featured: true,
    nextAvailable: "2024-01-26",
    tags: ["NBA", "Basketball", "Success", "Inspiration"]
  },
  {
    id: "11",
    name: "Michelle Obama",
    image: "/celeb2.jpg",
    category: "Motivator",
    bio: "Former First Lady and advocate. Delivers powerful messages about education, leadership, and making a difference.",
    price: 1599,
    rating: 5.0,
    reviewCount: 98,
    responseTime: "2 weeks",
    completedVideos: 67,
    verified: true,
    featured: true,
    nextAvailable: "2024-02-05",
    tags: ["Leadership", "Education", "Advocacy", "Inspiration"]
  },
  {
    id: "12",
    name: "Kevin Hart",
    image: "/celeb3.jpg",
    category: "Comedian",
    bio: "Stand-up comedian and actor. Creates hilarious, energetic video messages perfect for birthdays and celebrations.",
    price: 799,
    rating: 4.7,
    reviewCount: 267,
    responseTime: "48 hours",
    completedVideos: 189,
    verified: true,
    featured: false,
    nextAvailable: "2024-01-17",
    tags: ["Comedy", "Stand-up", "Energy", "Entertainment"]
  }
]

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

      // Try to fetch from database
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

      // Try to fetch from database
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

      if (dbCelebrities.length > 0) {
        // Use database results
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
      } else {
        console.log("No database results, using mock data")
        throw new Error("No database results")
      }
    } catch (dbError: unknown) {
      console.log("Database error, using mock data:", dbError instanceof Error ? dbError.message : String(dbError))
      useMockData = true
      
      // Apply filters to mock data
      let filteredCelebrities = [...mockCelebrities]

      // Category filter
      if (category && category !== "All") {
        filteredCelebrities = filteredCelebrities.filter(celeb => 
          celeb.category.toLowerCase().includes(category.toLowerCase())
        )
      }

      // Search filter
      if (search && search.trim()) {
        const searchTerm = search.trim().toLowerCase()
        filteredCelebrities = filteredCelebrities.filter(celeb =>
          celeb.name.toLowerCase().includes(searchTerm) ||
          celeb.category.toLowerCase().includes(searchTerm) ||
          celeb.bio.toLowerCase().includes(searchTerm) ||
          celeb.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        )
      }

      // Price range filter
      if (minPrice || maxPrice) {
        filteredCelebrities = filteredCelebrities.filter(celeb => {
          const price = celeb.price
          if (minPrice && price < Number(minPrice)) return false
          if (maxPrice && price > Number(maxPrice)) return false
          return true
        })
      }

      // Availability filter
      if (availability && availability !== "All") {
        const now = new Date()
        const thisWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        const nextWeek = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

        filteredCelebrities = filteredCelebrities.filter(celeb => {
          const availableDate = new Date(celeb.nextAvailable)
          switch (availability) {
            case "Available Now":
              return availableDate <= now
            case "Available This Week":
              return availableDate <= thisWeek
            case "Available Next Week":
              return availableDate <= nextWeek
            default:
              return true
          }
        })
      }

      // Featured filter
      if (featured === "true") {
        filteredCelebrities = filteredCelebrities.filter(celeb => celeb.featured)
      }

      // Sort mock data
      if (sortBy) {
        switch (sortBy) {
          case "Price: Low to High":
            filteredCelebrities.sort((a, b) => a.price - b.price)
            break
          case "Price: High to Low":
            filteredCelebrities.sort((a, b) => b.price - a.price)
            break
          case "Rating":
            filteredCelebrities.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
            break
          case "Response Time":
            // Sort by response time (convert to hours for sorting)
            filteredCelebrities.sort((a, b) => {
              const aHours = a.responseTime.includes("24") ? 24 : a.responseTime.includes("48") ? 48 : a.responseTime.includes("week") ? 168 : 72
              const bHours = b.responseTime.includes("24") ? 24 : b.responseTime.includes("48") ? 48 : b.responseTime.includes("week") ? 168 : 72
              return aHours - bHours
            })
            break
          case "Most Popular":
            filteredCelebrities.sort((a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating)
            break
          case "Featured":
          default:
            filteredCelebrities.sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating || b.reviewCount - a.reviewCount)
            break
        }
      }

      total = filteredCelebrities.length
      celebrities = filteredCelebrities.slice(skip, skip + limit)
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
      useMockData,
    })
  } catch (error) {
    console.error("Error fetching celebrities:", error)
    
    // Fallback to mock data on any error
    const page = Number.parseInt(new URL(request.url).searchParams.get("page") || "1")
    const limit = 12
    const skip = (page - 1) * limit
    const total = mockCelebrities.length
    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      celebrities: mockCelebrities.slice(skip, skip + limit),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
      useMockData: true,
      error: "Using fallback data due to system error",
    })
  }
}