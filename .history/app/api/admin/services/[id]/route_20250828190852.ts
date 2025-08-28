import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const service = await prisma.service.findUnique({
      where: { id: params.id },
      include: {
        features: {
          orderBy: { order: "asc" }
        }
      }
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error("Error fetching service:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Update service
    const updatedService = await prisma.service.update({
      where: { id: params.id },
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
        updatedBy: session.user.id
      }
    })

    // Update features if provided
    if (features && Array.isArray(features)) {
      // Delete existing features
      await prisma.serviceFeature.deleteMany({
        where: { serviceId: params.id }
      })

      // Create new features
      if (features.length > 0) {
        const featureData = features.map((feature: any, index: number) => ({
          serviceId: params.id,
          text: typeof feature === 'string' ? feature : feature.text,
          order: index
        }))

        await prisma.serviceFeature.createMany({
          data: featureData
        })
      }
    }

    // Fetch the updated service with features
    const serviceWithFeatures = await prisma.service.findUnique({
      where: { id: params.id },
      include: {
        features: {
          orderBy: { order: "asc" }
        }
      }
    })

    return NextResponse.json(serviceWithFeatures)
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: params.id }
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Delete service (features will be deleted automatically due to cascade)
    await prisma.service.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Service deleted successfully" })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}