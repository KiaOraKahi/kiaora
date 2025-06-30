import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "CELEBRITY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "all"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Mock data - replace with actual database queries
    const mockRequests = [
      {
        id: "1",
        orderNumber: "KO-2024-001",
        customerName: "Sarah Johnson",
        recipientName: "Mike Johnson",
        occasion: "Birthday",
        instructions: "Please mention his love for basketball and that he's turning 25!",
        amount: 150,
        requestedDate: "2024-01-15",
        status: "pending",
        createdAt: "2024-01-10T10:00:00Z",
        deadline: "2024-01-12T23:59:59Z",
      },
      {
        id: "2",
        orderNumber: "KO-2024-002",
        customerName: "Emily Davis",
        recipientName: "Tom Davis",
        occasion: "Anniversary",
        instructions: "Celebrating 10 years together, they love traveling and cooking.",
        amount: 200,
        requestedDate: "2024-01-20",
        status: "pending",
        createdAt: "2024-01-11T14:30:00Z",
        deadline: "2024-01-13T23:59:59Z",
      },
      {
        id: "3",
        orderNumber: "KO-2024-003",
        customerName: "John Smith",
        recipientName: "Lisa Smith",
        occasion: "Graduation",
        instructions: "She just graduated from medical school, very proud moment!",
        amount: 175,
        requestedDate: "2024-01-25",
        status: "accepted",
        createdAt: "2024-01-12T09:15:00Z",
        deadline: "2024-01-14T23:59:59Z",
      },
    ]

    // Filter by status if specified
    let filteredRequests = mockRequests
    if (status !== "all") {
      filteredRequests = mockRequests.filter((req) => req.status === status)
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedRequests = filteredRequests.slice(startIndex, endIndex)

    const response = {
      requests: paginatedRequests,
      pagination: {
        page,
        limit,
        total: filteredRequests.length,
        totalPages: Math.ceil(filteredRequests.length / limit),
        hasNext: endIndex < filteredRequests.length,
        hasPrev: page > 1,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching booking requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}