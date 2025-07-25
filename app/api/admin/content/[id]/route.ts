import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/content/[id] - Fetch single content item
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const content = await prisma.siteContent.findUnique({
      where: { id },
    })

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error("Error fetching content:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/admin/content/[id] - Update content
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
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

    // Check if content exists
    const existingContent = await prisma.siteContent.findUnique({
      where: { id },
    })

    if (!existingContent) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    // Check if key is being changed and if new key already exists
    if (key !== existingContent.key) {
      const keyExists = await prisma.siteContent.findUnique({
        where: { key },
      })

      if (keyExists) {
        return NextResponse.json(
          {
            error: "Content with this key already exists",
          },
          { status: 400 },
        )
      }
    }

    const updatedContent = await prisma.siteContent.update({
      where: { id },
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

    return NextResponse.json(updatedContent)
  } catch (error) {
    console.error("Error updating content:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/admin/content/[id] - Delete content
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check if content exists
    const existingContent = await prisma.siteContent.findUnique({
      where: { id },
    })

    if (!existingContent) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    await prisma.siteContent.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Content deleted successfully" })
  } catch (error) {
    console.error("Error deleting content:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}