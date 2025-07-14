import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        celebrity: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        order: {
          include: {
            tips: true,
          },
        },
        reviews: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action } = await request.json()

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        order: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    let updatedBooking

    switch (action) {
      case "cancel":
        updatedBooking = await prisma.booking.update({
          where: { id: params.id },
          data: { status: "CANCELLED" },
        })
        break

      case "complete":
        updatedBooking = await prisma.booking.update({
          where: { id: params.id },
          data: { status: "COMPLETED" },
        })
        break

      case "refund":
        if (booking.order?.paymentIntentId) {
          try {
            // Process refund through Stripe
            await stripe.refunds.create({
              payment_intent: booking.order.paymentIntentId,
            })

            // Update booking and order status
            await prisma.$transaction([
              prisma.booking.update({
                where: { id: params.id },
                data: { status: "CANCELLED" },
              }),
              prisma.order.update({
                where: { id: booking.order.id },
                data: {
                  status: "REFUNDED",
                  paymentStatus: "REFUNDED",
                },
              }),
            ])

            updatedBooking = await prisma.booking.findUnique({
              where: { id: params.id },
            })
          } catch (stripeError) {
            console.error("Stripe refund error:", stripeError)
            return NextResponse.json({ error: "Failed to process refund" }, { status: 500 })
          }
        } else {
          return NextResponse.json({ error: "No payment to refund" }, { status: 400 })
        }
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ booking: updatedBooking })
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}
