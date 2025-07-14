import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: celebrityId } = await params
    const { action } = await request.json()

    const celebrity = await prisma.celebrity.findUnique({
      where: { id: celebrityId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!celebrity) {
      return NextResponse.json({ error: "Celebrity not found" }, { status: 404 })
    }

    const updateData: any = {}

    switch (action) {
      case "activate":
        updateData.isActive = true
        break
      case "suspend":
        updateData.isActive = false
        break
      case "feature":
        updateData.featured = true
        break
      case "unfeature":
        updateData.featured = false
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const updatedCelebrity = await prisma.celebrity.update({
      where: { id: celebrityId },
      data: updateData,
    })

    // Log the admin action
    console.log(`Admin ${session.user.email} performed action "${action}" on celebrity ${celebrity.user.name}`)

    return NextResponse.json({
      success: true,
      message: `Celebrity ${action}d successfully`,
      celebrity: updatedCelebrity,
    })
  } catch (error) {
    console.error("Error updating celebrity:", error)
    return NextResponse.json({ error: "Failed to update celebrity" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: celebrityId } = await params

    const celebrity = await prisma.celebrity.findUnique({
      where: { id: celebrityId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
        bookings: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        reviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
    })

    if (!celebrity) {
      return NextResponse.json({ error: "Celebrity not found" }, { status: 404 })
    }

    const totalEarnings = celebrity.bookings
      .filter((booking) => booking.status === "COMPLETED")
      .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)

    const formattedCelebrity = {
      id: celebrity.id,
      name: celebrity.user.name || "Celebrity",
      email: celebrity.user.email || "",
      image: celebrity.user.image,
      category: celebrity.category || "Entertainment",
      basePrice: celebrity.pricePersonal || celebrity.price || 299,
      rating: celebrity.averageRating || 0,
      totalBookings: celebrity._count.bookings || 0,
      totalEarnings: Math.round(totalEarnings / 100), // Convert from cents to dollars
      completionRate: celebrity.completionRate || 0,
      stripeConnectStatus: celebrity.stripeConnectStatus || "NOT_CONNECTED",
      status: celebrity.isActive ? "ACTIVE" : "SUSPENDED",
      featured: celebrity.featured || false,
      createdAt: celebrity.createdAt.toISOString(),
      joinedAt: celebrity.user.createdAt.toISOString(),
      recentBookings: celebrity.bookings.map((booking) => ({
        id: booking.id,
        amount: Math.round((booking.totalAmount || 0) / 100),
        status: booking.status,
        date: booking.createdAt.toISOString(),
      })),
      recentReviews: celebrity.reviews.map((review) => ({
        rating: review.rating,
        comment: review.comment,
        user: review.user.name || "Anonymous",
        date: review.createdAt.toISOString(),
      })),
    }

    return NextResponse.json(formattedCelebrity)
  } catch (error) {
    console.error("Error fetching celebrity details:", error)
    return NextResponse.json({ error: "Failed to fetch celebrity details" }, { status: 500 })
  }
}