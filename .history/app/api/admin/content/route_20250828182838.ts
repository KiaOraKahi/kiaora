import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/content - Get all content
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const content = await prisma.content.findMany({
      orderBy: { updatedAt: "desc" }
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
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { key, value, type, category, description } = body

    if (!key || !value || !type || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if content with this key already exists
    const existingContent = await prisma.content.findUnique({
      where: { key }
    })

    if (existingContent) {
      return NextResponse.json({ error: "Content with this key already exists" }, { status: 400 })
    }

    const content = await prisma.content.create({
      data: {
        key,
        value,
        type,
        category,
        description,
        updatedBy: session.user.id
      }
    })

    return NextResponse.json(content, { status: 201 })
  } catch (error) {
    console.error("Error creating content:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
