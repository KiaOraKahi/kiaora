import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            bookings: true,
            reviews: true,
            tips: true,
          },
        },
        orders: {
          where: {
            status: "COMPLETED",
            paymentStatus: "SUCCEEDED",
          },
          select: {
            totalAmount: true,
          },
        },
        celebrityProfile: {
          select: {
            id: true,
            pricePersonal: true,
            priceBusiness: true,
            priceCharity: true,
            category: true,
            rating: true,
            totalEarnings: true,
            completionRate: true,
            isActive: true,
            verified: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const recentOrders = await prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        celebrity: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    const transformedUser = {
      id: user.id,
      name: user.name || "Unknown",
      email: user.email,
      role: user.role,
      emailVerified: !!user.emailVerified,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      totalBookings: user._count.bookings,
      totalOrders: user._count.orders,
      totalReviews: user._count.reviews,
      totalTips: user._count.tips,
      totalSpent: user.orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0),
      celebrityProfile: user.celebrityProfile,
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        celebrityName: order.celebrity.user.name || "Unknown",
      })),
    }

    return NextResponse.json({ user: transformedUser })
  } catch (error) {
    console.error("Error fetching user details:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id
    const body = await request.json()
    
    // Handle both action-based updates and direct field updates
    if (body.action) {
      const { action, name, email, role, isVerified } = body

      let updateData: any = {}
      let message = ""

      switch (action) {
        case "verify":
          updateData = { isVerified: true }
          message = "User verified successfully"
          break

        case "unverify":
          updateData = { isVerified: false }
          message = "User unverified successfully"
          break

        case "update":
          updateData = {
            name,
            email,
            role,
            isVerified,
          }
          message = "User updated successfully"
          break

        default:
          return NextResponse.json({ error: "Invalid action" }, { status: 400 })
      }

      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: {
              orders: true,
              bookings: true,
            },
          },
        },
      })

      if (!existingUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      await prisma.user.update({
        where: { id: userId },
        data: updateData,
      })

      return NextResponse.json({ message })
    } else {
      // Direct field updates (for the frontend edit form)
      const { name, email, role } = body

      if (!name || !email || !role) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      }

      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!existingUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Check if email is being changed and if it already exists
      if (email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email }
        })
        if (emailExists) {
          return NextResponse.json({ error: "Email already exists" }, { status: 400 })
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          email,
          role
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          createdAt: true
        }
      })

      return NextResponse.json({ 
        success: true, 
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          status: updatedUser.emailVerified ? "verified" : "unverified",
          joined: updatedUser.createdAt
        }
      })
    }
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id

    const userWithRelations = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            orders: true,
            bookings: true,
          },
        },
      },
    })

    if (!userWithRelations) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (userWithRelations._count.orders > 0 || userWithRelations._count.bookings > 0) {
      return NextResponse.json({ error: "Cannot delete user with existing orders or bookings" }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}