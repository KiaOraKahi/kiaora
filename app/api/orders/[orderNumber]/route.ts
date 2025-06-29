import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { orderNumber: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderNumber } = params

    // Get order details with booking and celebrity info
    const orderDetails = await sql`
      SELECT 
        o.*,
        b.*,
        u.name as "userName",
        u.email as "userEmail",
        cu.name as "celebrityName",
        cu.image as "celebrityImage",
        c.category as "celebrityCategory"
      FROM "Order" o
      JOIN "Booking" b ON o."bookingId" = b.id
      JOIN "User" u ON b."userId" = u.id
      JOIN "Celebrity" c ON b."celebrityId" = c.id
      JOIN "User" cu ON c."userId" = cu.id
      WHERE o."orderNumber" = ${orderNumber}
        AND (b."userId" = ${session.user.id} OR cu.id = ${session.user.id})
    `

    if (orderDetails.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Get order items
    const orderItems = await sql`
      SELECT * FROM "OrderItem"
      WHERE "orderId" = ${orderDetails[0].id}
      ORDER BY "createdAt"
    `

    // Get payment transactions
    const transactions = await sql`
      SELECT * FROM "PaymentTransaction"
      WHERE "orderId" = ${orderDetails[0].id}
      ORDER BY "createdAt" DESC
    `

    const order = {
      ...orderDetails[0],
      items: orderItems,
      transactions: transactions,
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Get order error:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}
