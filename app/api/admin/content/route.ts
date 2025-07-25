import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/content - Fetch all content
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const content = await prisma.siteContent.findMany({
      orderBy: [{ category: "asc" }, { key: "asc" }],
    })

    return NextResponse.json(content)
  } catch (error) {
    console.error("Error fetching content:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/admin/content - Create new content
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { key, value, type, category, description, isActive } = body

    // Validate required fields
    if (!key || !value || !type || !category) {
      return NextResponse.json(
        {
          error: "Missing required fields: key, value, type, category",
        },
        { status: 400 },
      )
    }

    // Check if key already exists
    const existingContent = await prisma.siteContent.findUnique({
      where: { key },
    })

    if (existingContent) {
      return NextResponse.json(
        {
          error: "Content with this key already exists",
        },
        { status: 400 },
      )
    }

    const content = await prisma.siteContent.create({
      data: {
        key,
        value,
        type,
        category,
        description,
        isActive: isActive ?? true,
        updatedBy: session.user.id,
      },
    })

    return NextResponse.json(content, { status: 201 })
  } catch (error) {
    console.error("Error creating content:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
