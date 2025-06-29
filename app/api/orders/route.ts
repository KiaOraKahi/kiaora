import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const offset = (page - 1) * limit

    // Build query conditions
    let whereCondition = `b."userId" = '${session.user.id}'`
    if (status && status !== "all") {
      whereCondition += ` AND o.status = '${status}'`
    }

    // Get orders with pagination
    const orders = await sql`
      SELECT 
        o.*,
        b."recipientName",
        b.occasion,
        b."scheduledDate",
        b."scheduledTime",
        b.status as "bookingStatus",
        cu.name as "celebrityName",
        cu.image as "celebrityImage",
        c.category as "celebrityCategory"
      FROM "Order" o
      JOIN "Booking" b ON o."bookingId" = b.id
      JOIN "Celebrity" c ON b."celebrityId" = c.id
      JOIN "User" cu ON c."userId" = cu.id
      WHERE ${sql.unsafe(whereCondition)}
      ORDER BY o."createdAt" DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    // Get total count
    const totalResult = await sql`
      SELECT COUNT(*) as total
      FROM "Order" o
      JOIN "Booking" b ON o."bookingId" = b.id
      WHERE ${sql.unsafe(whereCondition)}
    `

    const total = Number.parseInt(totalResult[0].total)
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Get orders error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}