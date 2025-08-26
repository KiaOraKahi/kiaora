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

    // Get celebrity profile
    const celebrity = await prisma.celebrity.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    if (!celebrity) {
      return NextResponse.json({ error: "Celebrity profile not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: celebrity.id,
      name: celebrity.user.name,
      email: celebrity.user.email,
      image: celebrity.user.image,
      bio: celebrity.bio || "",
      longBio: celebrity.longBio || "",
      category: celebrity.category || "",
      pricePersonal: celebrity.pricePersonal || 299,
      priceBusiness: celebrity.priceBusiness || 599,
      priceCharity: celebrity.priceCharity || 199,
      isActive: celebrity.isActive,
      verified: celebrity.verified,
      responseTime: celebrity.responseTime || "24 hours",
      nextAvailable: celebrity.nextAvailable || "2024-01-15",
      tags: celebrity.tags || [],
      achievements: celebrity.achievements || [],
    })
  } catch (error) {
    console.error("Error fetching celebrity profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      bio,
      longBio,
      category,
      pricePersonal,
      priceBusiness,
      priceCharity,
      isActive,
      responseTime,
      nextAvailable,
      tags,
      achievements,
    } = body

    // Get celebrity profile
    const celebrity = await prisma.celebrity.findUnique({
      where: { userId: session.user.id },
    })

    if (!celebrity) {
      return NextResponse.json({ error: "Celebrity profile not found" }, { status: 404 })
    }

    // Update celebrity profile
    const updatedCelebrity = await prisma.celebrity.update({
      where: { id: celebrity.id },
      data: {
        bio: bio !== undefined ? bio : celebrity.bio,
        longBio: longBio !== undefined ? longBio : celebrity.longBio,
        category: category !== undefined ? category : celebrity.category,
        pricePersonal: pricePersonal !== undefined ? Number(pricePersonal) : celebrity.pricePersonal,
        priceBusiness: priceBusiness !== undefined ? Number(priceBusiness) : celebrity.priceBusiness,
        priceCharity: priceCharity !== undefined ? Number(priceCharity) : celebrity.priceCharity,
        isActive: isActive !== undefined ? isActive : celebrity.isActive,
        responseTime: responseTime !== undefined ? responseTime : celebrity.responseTime,
        nextAvailable: nextAvailable !== undefined ? nextAvailable : celebrity.nextAvailable,
        tags: tags !== undefined ? tags : celebrity.tags,
        achievements: achievements !== undefined ? achievements : celebrity.achievements,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json({
      id: updatedCelebrity.id,
      name: updatedCelebrity.user.name,
      email: updatedCelebrity.user.email,
      image: updatedCelebrity.user.image,
      bio: updatedCelebrity.bio,
      longBio: updatedCelebrity.longBio,
      category: updatedCelebrity.category,
      pricePersonal: updatedCelebrity.pricePersonal,
      priceBusiness: updatedCelebrity.priceBusiness,
      priceCharity: updatedCelebrity.priceCharity,
      isActive: updatedCelebrity.isActive,
      verified: updatedCelebrity.verified,
      responseTime: updatedCelebrity.responseTime,
      nextAvailable: updatedCelebrity.nextAvailable,
      tags: updatedCelebrity.tags,
      achievements: updatedCelebrity.achievements,
    })
  } catch (error) {
    console.error("Error updating celebrity profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}