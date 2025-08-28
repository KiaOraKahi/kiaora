import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const services = await prisma.service.findMany({
      include: {
        features: {
          orderBy: { order: "asc" }
        }
      },
      orderBy: { order: "asc" }
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
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
      popular,
      isActive,
      currency,
      features
    } = body

    // Validate required fields
    if (!title || !shortDescription || !icon || !color) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create service
    const service = await prisma.service.create({
      data: {
        title,
        shortDescription,
        fullDescription: fullDescription || shortDescription,
        icon,
        color,
        startingPrice: startingPrice || 0,
        asapPrice: asapPrice || 0,
        duration: duration || "",
        deliveryTime: deliveryTime || "",
        asapDeliveryTime: asapDeliveryTime || "",
        popular: popular || false,
        isActive: isActive !== undefined ? isActive : true,
        currency: currency || "nzd",
        order: 0,
        createdBy: session.user.id,
        updatedBy: session.user.id
      },
      include: {
        features: true
      }
    })

    // Create features if provided
    if (features && Array.isArray(features) && features.length > 0) {
      const featureData = features.map((feature: string, index: number) => ({
        serviceId: service.id,
        text: feature,
        order: index
      }))

      await prisma.serviceFeature.createMany({
        data: featureData
      })

      // Fetch the service with features
      const serviceWithFeatures = await prisma.service.findUnique({
        where: { id: service.id },
        include: {
          features: {
            orderBy: { order: "asc" }
          }
        }
      })

      return NextResponse.json(serviceWithFeatures)
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
