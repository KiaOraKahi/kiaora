import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Fetching services for admin dashboard...")

    const services = await prisma.service.findMany({
      include: {
        features: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    })

    console.log(
      `Found ${services.length} services:`,
      services.map((s) => ({ id: s.id, title: s.title })),
    )

    return NextResponse.json({ services })
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      shortDescription,
      fullDescription,
      icon,
      color,
      startingPrice,
      asapPrice,
      currency = "nzd",
      duration,
      deliveryTime,
      asapDeliveryTime,
      isActive = true,
      popular = false,
      order = 0,
      features = [],
      samples = [],
      talents = [],
    } = body

    // Create service with features
    const service = await prisma.service.create({
      data: {
        title,
        description,
        shortDescription,
        fullDescription,
        icon,
        color,
        startingPrice: Number.parseFloat(startingPrice),
        asapPrice: Number.parseFloat(asapPrice),
        currency,
        duration,
        deliveryTime,
        asapDeliveryTime,
        isActive,
        popular,
        order: Number.parseInt(order),
        samples: JSON.stringify(samples),
        talents: JSON.stringify(talents),
        updatedBy: session.user.id,
        features: {
          create: features.map((feature: string, index: number) => ({
            text: feature,
            order: index,
          })),
        },
      },
      include: {
        features: {
          orderBy: { order: "asc" },
        },
      },
    })

    return NextResponse.json({ service })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
}
