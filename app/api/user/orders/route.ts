import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mock user orders data for demonstration
    const userOrders = [
      {
        id: "1",
        orderNumber: "KO-1234567890-ABC123",
        status: "completed",
        paymentStatus: "paid",
        totalAmount: 299,
        createdAt: "2024-01-15T10:00:00Z",
        recipientName: "Sarah Johnson",
        occasion: "birthday",
        scheduledDate: "2024-01-20T00:00:00Z",
        scheduledTime: "2:00 PM",
        bookingStatus: "confirmed",
        celebrityName: "Emma Stone",
        celebrityImage: "/celeb1.jpg",
        celebrityCategory: "Actor",
        approvalStatus: "approved",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tipAmount: 50,
      },
      {
        id: "2",
        orderNumber: "KO-1234567891-DEF456",
        status: "in_progress",
        paymentStatus: "paid",
        totalAmount: 599,
        createdAt: "2024-01-16T14:30:00Z",
        recipientName: "Michael Chen",
        occasion: "anniversary",
        scheduledDate: "2024-01-25T00:00:00Z",
        scheduledTime: "6:00 PM",
        bookingStatus: "confirmed",
        celebrityName: "John Legend",
        celebrityImage: "/celeb2.jpg",
        celebrityCategory: "Musician",
        approvalStatus: "pending_approval",
      },
      {
        id: "3",
        orderNumber: "KO-1234567892-GHI789",
        status: "pending",
        paymentStatus: "paid",
        totalAmount: 899,
        createdAt: "2024-01-17T09:15:00Z",
        recipientName: "Lisa Rodriguez",
        occasion: "graduation",
        scheduledDate: "2024-01-30T00:00:00Z",
        scheduledTime: "12:00 PM",
        bookingStatus: "confirmed",
        celebrityName: "Tony Robbins",
        celebrityImage: "/celeb3.jpg",
        celebrityCategory: "Motivator",
      },
    ]

    return NextResponse.json({ orders: userOrders })
  } catch (error) {
    console.error("Error fetching user orders:", error)
    return NextResponse.json({ error: "Failed to fetch user orders" }, { status: 500 })
  }
} 