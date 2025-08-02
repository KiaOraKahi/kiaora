import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/services/[id] - Get single service
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const service = await prisma.service.findUnique({
      where: { id: params.id },
      include: {
        features: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error("Error fetching service:", error)
    return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 })
  }
}

// PUT /api/admin/services/[id] - Update single service
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    
    // Handle simple status toggle (just isActive field)
    if (Object.keys(data).length === 1 && 'isActive' in data) {
      const service = await prisma.service.update({
        where: { id: params.id },
        data: {
          isActive: data.isActive,
          updatedBy: session.user.id,
        },
        include: {
          features: {
            orderBy: { order: "asc" },
          },
        },
      })

      return NextResponse.json(service)
    }

    // Handle full service update
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
      features = [],
    } = data

    // First, check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id: params.id },
      include: { features: true },
    })

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Update service in a transaction to handle features properly
    const updatedService = await prisma.$transaction(async (tx) => {
      // Delete existing features
      await tx.serviceFeature.deleteMany({
        where: { serviceId: params.id },
      })

      // Update the service with new data and create new features
      const service = await tx.service.update({
        where: { id: params.id },
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
          popular,
          isActive,
          updatedBy: session.user.id,
          features: {
            create: features.map((feature: string, index: number) => ({
              text: feature,
              order: index + 1,
            })),
          },
        },
        include: {
          features: {
            orderBy: { order: "asc" },
          },
        },
      })

      return service
    })

    return NextResponse.json(updatedService)
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
  }
}

// DELETE /api/admin/services/[id] - Delete single service
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id: params.id },
    })

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Delete service (features will be cascade deleted due to the relation)
    await prisma.service.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Service deleted successfully" })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
  }
}