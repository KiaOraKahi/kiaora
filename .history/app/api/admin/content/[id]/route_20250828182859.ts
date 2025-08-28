import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/content/[id] - Get specific content
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const content = await prisma.content.findUnique({
      where: { id: params.id }
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
    const { key, value, type, category, description, status } = body

    if (!key || !value || !type || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if content exists
    const existingContent = await prisma.content.findUnique({
      where: { id: params.id }
    })

    if (!existingContent) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    // Check if key is being changed and if it conflicts with another content
    if (key !== existingContent.key) {
      const keyConflict = await prisma.content.findUnique({
        where: { key }
      })

      if (keyConflict) {
        return NextResponse.json({ error: "Content with this key already exists" }, { status: 400 })
      }
    }

    const updatedContent = await prisma.content.update({
      where: { id: params.id },
      data: {
        key,
        value,
        type,
        category,
        description,
        status,
        updatedBy: session.user.id
      }
    })

    return NextResponse.json(updatedContent)
  } catch (error) {
    console.error("Error updating content:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/admin/content/[id] - Delete content
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if content exists
    const existingContent = await prisma.content.findUnique({
      where: { id: params.id }
    })

    if (!existingContent) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    await prisma.content.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Content deleted successfully" })
  } catch (error) {
    console.error("Error deleting content:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}