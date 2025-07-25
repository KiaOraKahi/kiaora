import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const services = await prisma.service.findMany({
      orderBy: { order: "asc" },
      include: {
        features: {
          orderBy: { order: "asc" },
        },
      },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const {
      title,
      shortDescription,
      fullDescription,
      icon,
      color,
      startingPrice,
      asapPrice,
      duration,
      deliveryTime,
      asapDeliveryTime,
      category,
      popular,
      isActive,
      features,
    } = data

    const lastService = await prisma.service.findFirst({
      orderBy: { order: "desc" },
    })
    const nextOrder = (lastService?.order || 0) + 1

    const service = await prisma.service.create({
      data: {
        title,
        shortDescription,
        fullDescription,
        icon,
        color,
        startingPrice,
        asapPrice,
        duration,
        deliveryTime,
        asapDeliveryTime,
        category,
        popular: popular || false,
        isActive: isActive !== false,
        order: nextOrder,
        updatedBy: session.user.id,
        features: {
          create:
            features?.map((feature: string, index: number) => ({
              text: feature,
              order: index + 1,
            })) || [],
        },
      },
      include: {
        features: {
          orderBy: { order: "asc" },
        },
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
}
