import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addSampleData() {
  try {
    console.log('Adding sample data for admin dashboard testing...')

    // Create sample users with different creation dates
    const users = [
      {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O", // password123
        role: "FAN",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      },
      {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O",
        role: "FAN",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
      },
      {
        name: "Mike Johnson",
        email: "mike.johnson@example.com",
        password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O",
        role: "FAN",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        name: "Sarah Wilson",
        email: "sarah.wilson@example.com",
        password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O",
        role: "CELEBRITY",
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) // 25 days ago
      },
      {
        name: "David Brown",
        email: "david.brown@example.com",
        password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O",
        role: "CELEBRITY",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      }
    ]

    for (const userData of users) {
      const user = await prisma.user.create({
        data: userData
      })
      console.log(`Created user: ${user.name} (${user.role})`)

      // If it's a celebrity, create a celebrity profile
      if (user.role === "CELEBRITY") {
        await prisma.celebrity.create({
          data: {
            userId: user.id,
            isActive: true,
            verified: true,
            bio: `Sample bio for ${user.name}`,
            category: "Entertainment",
            price: Math.floor(Math.random() * 500) + 100
          }
        })
        console.log(`Created celebrity profile for: ${user.name}`)
      }
    }

    // Create sample orders with different dates
    const orders = [
      {
        totalAmount: 299,
        paymentStatus: "SUCCEEDED",
        status: "CONFIRMED",
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000) // 35 days ago
      },
      {
        totalAmount: 499,
        paymentStatus: "SUCCEEDED",
        status: "COMPLETED",
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
      },
      {
        totalAmount: 199,
        paymentStatus: "SUCCEEDED",
        status: "CONFIRMED",
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 days ago
      },
      {
        totalAmount: 799,
        paymentStatus: "SUCCEEDED",
        status: "PENDING",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    ]

    // Get existing users for order creation
    const existingUsers = await prisma.user.findMany()
    const existingCelebrities = await prisma.celebrity.findMany()

    for (const orderData of orders) {
      const user = existingUsers[Math.floor(Math.random() * existingUsers.length)]
      const celebrity = existingCelebrities[Math.floor(Math.random() * existingCelebrities.length)]

      if (user && celebrity) {
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        await prisma.order.create({
          data: {
            ...orderData,
            orderNumber: orderNumber,
            userId: user.id,
            celebrityId: celebrity.id,
            recipientName: "Sample Recipient",
            occasion: "Birthday",
            personalMessage: "Happy Birthday!",
            booking: {
              create: {
                orderNumber: orderNumber,
                recipientName: "Sample Recipient",
                price: orderData.totalAmount,
                totalAmount: orderData.totalAmount,
                userId: user.id,
                celebrityId: celebrity.id
              }
            }
          }
        })
        console.log(`Created order: $${orderData.totalAmount} (${orderData.status})`)
      }
    }

    console.log('Sample data added successfully!')
    console.log('You should now see meaningful percentage changes in the admin dashboard.')

  } catch (error) {
    console.error('Error adding sample data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addSampleData()
