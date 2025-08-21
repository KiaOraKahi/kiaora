import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mock user payments data for demonstration
    const userPayments = [
      {
        id: "1",
        orderNumber: "KO-1234567890-ABC123",
        amount: 299,
        status: "completed",
        date: "2024-01-15T10:00:00Z",
        type: "booking" as const,
        description: "Emma Stone - Personal Video Message",
        celebrityName: "Emma Stone",
      },
      {
        id: "2",
        orderNumber: "KO-1234567890-ABC123",
        amount: 50,
        status: "completed",
        date: "2024-01-22T16:00:00Z",
        type: "tip" as const,
        description: "Tip for Emma Stone",
        celebrityName: "Emma Stone",
      },
      {
        id: "3",
        orderNumber: "KO-1234567891-DEF456",
        amount: 599,
        status: "completed",
        date: "2024-01-16T14:30:00Z",
        type: "booking" as const,
        description: "John Legend - Personal Video Message",
        celebrityName: "John Legend",
      },
      {
        id: "4",
        orderNumber: "KO-1234567892-GHI789",
        amount: 899,
        status: "completed",
        date: "2024-01-17T09:15:00Z",
        type: "booking" as const,
        description: "Tony Robbins - Personal Video Message",
        celebrityName: "Tony Robbins",
      },
    ]

    return NextResponse.json({ payments: userPayments })
  } catch (error) {
    console.error("Error fetching user payments:", error)
    return NextResponse.json({ error: "Failed to fetch user payments" }, { status: 500 })
  }
} 