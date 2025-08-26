import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Mock celebrity data for testing when database is unavailable
const mockCelebrities = {
  "1": {
    id: "1",
    name: "Emma Stone",
    email: "emma@example.com",
    image: "/talents/1.jpeg",
    coverImage: "/talents/1.jpeg",
    category: "Actor",
    rating: 4.9,
    reviewCount: 127,
    price: 299,
    responseTime: "24 hours",
    verified: true,
    featured: true,
    bio: "Academy Award-winning actress known for her versatile performances in comedy and drama. Perfect for personalized birthday messages and special occasions.",
    longBio: "Emma Stone is an Academy Award-winning actress who has captivated audiences worldwide with her incredible range and authentic performances. From her breakthrough role in 'Superbad' to her Oscar-winning performance in 'La La Land', Emma has proven herself as one of Hollywood's most talented and versatile actresses. Her natural charm, quick wit, and genuine personality make her perfect for creating heartfelt, personalized video messages that will truly touch the hearts of your loved ones. Whether it's a birthday celebration, anniversary surprise, or just a special hello, Emma's messages are filled with warmth, humor, and genuine care that makes every moment unforgettable.",
    tags: ["Hollywood", "Award Winner", "Comedy", "Drama", "Versatile", "Charming"],
    achievements: ["Academy Award Winner", "Golden Globe Winner", "BAFTA Winner", "Screen Actors Guild Award"],
    sampleVideos: [
      {
        id: "1",
        title: "Birthday Message for Sarah",
        thumbnail: "/talents/1.jpeg",
        duration: "1:23",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
      },
      {
        id: "2",
        title: "Congratulations Message",
        thumbnail: "/talents/1.jpeg",
        duration: "0:58",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
      },
      {
        id: "3",
        title: "Motivational Message",
        thumbnail: "/celeb1.jpg",
        duration: "1:45",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
      }
    ],
    availability: {
      nextAvailable: "2024-01-15",
      averageDelivery: "2-3 days",
      completionRate: 98,
      totalOrders: 89
    },
    pricing: {
      personal: 299,
      business: 599,
      charity: 199
    },
    reviews: [
      {
        id: "1",
        user: "Sarah M.",
        rating: 5,
        date: "2024-01-10",
        comment: "Emma's message was absolutely perfect! She captured exactly what I wanted to say and made my sister's birthday so special. The video quality was amazing and she delivered it right on time.",
        verified: true,
        occasion: "Birthday"
      },
      {
        id: "2",
        user: "Michael R.",
        rating: 5,
        date: "2024-01-08",
        comment: "Incredible experience! Emma was so genuine and personal in her message. My wife was moved to tears. Worth every penny and more!",
        verified: true,
        occasion: "Anniversary"
      },
      {
        id: "3",
        user: "Jennifer L.",
        rating: 4,
        date: "2024-01-05",
        comment: "Great message from Emma! She was funny and sweet. Only giving 4 stars because it took a bit longer than expected, but the quality was excellent.",
        verified: true,
        occasion: "Graduation"
      }
    ]
  },
  "2": {
    id: "2",
    name: "John Legend",
    email: "john@example.com",
    image: "/celeb2.jpg",
    coverImage: "/celeb2.jpg",
    category: "Musician",
    rating: 5.0,
    reviewCount: 203,
    price: 599,
    responseTime: "48 hours",
    verified: true,
    featured: true,
    bio: "Grammy-winning singer-songwriter and pianist. Creates heartfelt, soulful video messages perfect for romantic occasions and celebrations.",
    longBio: "John Legend is a 12-time Grammy Award-winning artist, Oscar winner, and one of the most respected voices in music today. Known for his soulful voice and heartfelt lyrics, John has touched millions of hearts with songs like 'All of Me' and 'Ordinary People'. His genuine warmth and emotional depth make him perfect for creating meaningful video messages that will resonate deeply with your loved ones. Whether it's a romantic anniversary message, a heartfelt birthday wish, or words of encouragement, John's messages carry the same emotional weight and authenticity that has made him a beloved artist worldwide. His ability to connect on a personal level ensures that every message feels like it was created just for you.",
    tags: ["Grammy Winner", "Soul", "Piano", "Romantic", "Emotional", "Authentic"],
    achievements: ["12x Grammy Award Winner", "Academy Award Winner", "Golden Globe Winner", "Tony Award Winner"],
    sampleVideos: [
      {
        id: "4",
        title: "Romantic Anniversary Message",
        thumbnail: "/celeb2.jpg",
        duration: "2:15",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
      },
      {
        id: "5",
        title: "Birthday Song for Mom",
        thumbnail: "/celeb2.jpg",
        duration: "1:52",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
      }
    ],
    availability: {
      nextAvailable: "2024-01-16",
      averageDelivery: "3-4 days",
      completionRate: 97,
      totalOrders: 156
    },
    pricing: {
      personal: 599,
      business: 899,
      charity: 299
    },
    reviews: [
      {
        id: "4",
        user: "David K.",
        rating: 5,
        date: "2024-01-12",
        comment: "John's message was absolutely magical! His voice and the way he personalized it for my wife's birthday was incredible. She was speechless and so touched. This is a memory we'll cherish forever.",
        verified: true,
        occasion: "Birthday"
      },
      {
        id: "5",
        user: "Lisa P.",
        rating: 5,
        date: "2024-01-09",
        comment: "Incredible experience! John's message was so personal and heartfelt. My husband was moved to tears on our anniversary. The quality and timing were perfect.",
        verified: true,
        occasion: "Anniversary"
      }
    ]
  },
  "3": {
    id: "3",
    name: "Tony Robbins",
    email: "tony@example.com",
    image: "/celeb3.jpg",
    coverImage: "/celeb3.jpg",
    category: "Motivator",
    rating: 4.8,
    reviewCount: 89,
    price: 899,
    responseTime: "72 hours",
    verified: true,
    featured: true,
    bio: "World-renowned life coach and motivational speaker. Inspires with powerful messages for business success and personal development.",
    longBio: "Tony Robbins is a world-renowned life coach, motivational speaker, and author who has transformed the lives of millions of people worldwide. Known for his powerful presence and ability to inspire change, Tony has worked with world leaders, athletes, and business executives to help them achieve their full potential. His motivational messages are not just words – they're catalysts for transformation that can change the trajectory of someone's life. Whether you need motivation for a business venture, personal goal, or life challenge, Tony's messages carry the same energy and power that has made him one of the most sought-after speakers in the world. His ability to connect with people on a deep level ensures that every message is impactful and memorable.",
    tags: ["Motivation", "Business", "Leadership", "Success", "Transformation", "Inspiration"],
    achievements: ["Life Coach to World Leaders", "Best-selling Author", "Peak Performance Coach", "Business Strategist"],
    sampleVideos: [
      {
        id: "6",
        title: "Business Motivation Message",
        thumbnail: "/celeb3.jpg",
        duration: "3:22",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
      },
      {
        id: "7",
        title: "Personal Development Message",
        thumbnail: "/celeb3.jpg",
        duration: "2:48",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
      }
    ],
    availability: {
      nextAvailable: "2024-01-20",
      averageDelivery: "5-7 days",
      completionRate: 95,
      totalOrders: 67
    },
    pricing: {
      personal: 899,
      business: 1499,
      charity: 399
    },
    reviews: [
      {
        id: "6",
        user: "Robert T.",
        rating: 5,
        date: "2024-01-11",
        comment: "Tony's message was absolutely life-changing! His words gave me the motivation I needed to take my business to the next level. The energy and passion in his delivery was incredible.",
        verified: true,
        occasion: "Business Motivation"
      },
      {
        id: "7",
        user: "Amanda S.",
        rating: 4,
        date: "2024-01-07",
        comment: "Great motivational message from Tony! He really personalized it for my situation and gave me actionable advice. The delivery was powerful and inspiring.",
        verified: true,
        occasion: "Personal Development"
      }
    ]
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: celebrityId } = await params

    // Try to fetch from database first
    try {
      const celebrity = await prisma.celebrity.findUnique({
        where: {
          id: celebrityId,
          isActive: true,
        },
        include: {
          user: {
            select: {
              name: true,
              image: true,
              email: true,
            },
          },
          reviews: {
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
            take: 10,
          },
          sampleVideos: {
            orderBy: {
              createdAt: "desc",
            },
          },
          _count: {
            select: {
              reviews: true,
              bookings: true,
            },
          },
        },
      })

      if (celebrity) {
        // Format the response to match the expected structure
        const formattedCelebrity = {
          id: celebrity.id,
          name: celebrity.user.name || "Celebrity",
          email: celebrity.user.email || "",
          image: celebrity.user.image || "/placeholder.svg?height=400&width=400",
          coverImage: celebrity.coverImage || celebrity.user.image || "/placeholder.svg?height=400&width=1200",
          category: celebrity.category || "Entertainment",
          rating: celebrity.averageRating || 4.5,
          reviewCount: celebrity._count.reviews || 0,
          price: celebrity.price || 299,
          responseTime: celebrity.responseTime || "24 hours",
          verified: celebrity.verified || false,
          featured: celebrity.featured || false,
          bio: celebrity.bio || "Professional celebrity",
          longBio: celebrity.longBio || celebrity.bio || "Professional celebrity with years of experience",
          tags: celebrity.tags || [],
          achievements: celebrity.achievements || [],
          sampleVideos: celebrity.sampleVideos.map((video) => ({
            id: video.id,
            title: video.title,
            thumbnail: video.thumbnail || "/placeholder.svg?height=200&width=300",
            duration: video.duration || "0:30",
            videoUrl: video.videoUrl,
          })),
          availability: {
            nextAvailable: celebrity.nextAvailable || "2024-01-15",
            averageDelivery: "3-5 days",
            completionRate: celebrity.completionRate || 95,
            totalOrders: celebrity._count.bookings || 0,
          },
          pricing: {
            personal: celebrity.price || 299,
            business: celebrity.price || 599,
            charity: celebrity.price || 199,
          },
          reviews: celebrity.reviews.map((review) => ({
            id: review.id,
            user: review.user.name || "Anonymous",
            rating: review.rating,
            date: new Date(review.createdAt).toLocaleDateString(),
            comment: review.comment || "",
            verified: review.verified,
            occasion: review.occasion || "General",
          })),
        }

        return NextResponse.json(formattedCelebrity)
      }
    } catch (dbError) {
      console.log("Database error, using mock data:", dbError instanceof Error ? dbError.message : String(dbError))
    }

    // Fallback to mock data
    const mockCelebrity = mockCelebrities[celebrityId as keyof typeof mockCelebrities]
    
    if (mockCelebrity) {
      return NextResponse.json({
        ...mockCelebrity,
        useMockData: true
      })
    }

    return NextResponse.json({ error: "Celebrity not found" }, { status: 404 })
  } catch (error) {
    console.error("Error fetching celebrity:", error)
    
    // Try to return mock data as last resort
    const { id: celebrityId } = await params
    const mockCelebrity = mockCelebrities[celebrityId as keyof typeof mockCelebrities]
    
    if (mockCelebrity) {
      return NextResponse.json({
        ...mockCelebrity,
        useMockData: true,
        error: "Using fallback data due to system error"
      })
    }
    
    return NextResponse.json({ error: "Failed to fetch celebrity" }, { status: 500 })
  }
}
