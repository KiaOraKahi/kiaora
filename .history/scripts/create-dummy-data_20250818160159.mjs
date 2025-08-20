import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createDummyData() {
  try {
    console.log('🔧 Creating dummy data for PDF export testing...')
    
    // Find Emma Stone's celebrity profile
    const celebrity = await prisma.celebrity.findFirst({
      where: {
        user: {
          name: {
            contains: 'Emma'
          }
        }
      },
      include: {
        user: true
      }
    })
    
    if (!celebrity) {
      console.log('❌ Emma Stone not found')
      return
    }
    
    console.log('✅ Found celebrity:', celebrity.user.name)
    
    // Create dummy payments/orders for the last 6 months
    const paymentsData = [
      { amount: 2500, occasion: "Birthday", createdAt: new Date('2024-01-10') },
      { amount: 1800, occasion: "Anniversary", createdAt: new Date('2024-01-25') },
      { amount: 3200, occasion: "Graduation", createdAt: new Date('2024-02-05') },
      { amount: 1500, occasion: "Wedding", createdAt: new Date('2024-02-20') },
      { amount: 2800, occasion: "Retirement", createdAt: new Date('2024-03-12') },
      { amount: 2200, occasion: "Birthday", createdAt: new Date('2024-03-28') },
      { amount: 3500, occasion: "Anniversary", createdAt: new Date('2024-04-08') },
      { amount: 1900, occasion: "Graduation", createdAt: new Date('2024-04-22') },
      { amount: 2700, occasion: "Wedding", createdAt: new Date('2024-05-15') },
      { amount: 2100, occasion: "Retirement", createdAt: new Date('2024-05-30') },
      { amount: 3300, occasion: "Birthday", createdAt: new Date('2024-06-10') },
      { amount: 2400, occasion: "Anniversary", createdAt: new Date('2024-06-28') },
    ]
    
    // Create dummy orders with bookings and tips
    console.log('💳 Creating dummy payments and tips...')
    const createdOrders = []
    
    for (let i = 0; i < paymentsData.length; i++) {
      const paymentData = paymentsData[i]
      const orderNumber = `KO-${Date.now()}-${i.toString().padStart(4, '0')}`
      
      // Create order
      const order = await prisma.order.create({
        data: {
          orderNumber: orderNumber,
          celebrityId: celebrity.id,
          userId: celebrity.userId, // Using celebrity as customer for demo
          totalAmount: paymentData.amount,
          celebrityAmount: Math.floor(paymentData.amount * 0.8),
          platformFee: Math.floor(paymentData.amount * 0.2),
          status: 'CONFIRMED',
          paymentStatus: 'SUCCEEDED',
          occasion: paymentData.occasion,
          recipientName: 'Demo Recipient',
          specialInstructions: 'Demo instructions',
          personalMessage: 'Demo message',
          messageType: 'PERSONAL',
          email: 'demo@example.com',
          createdAt: paymentData.createdAt,
          updatedAt: paymentData.createdAt,
          paidAt: paymentData.createdAt
        }
      })
      
      createdOrders.push(order)
      
      // Create corresponding booking
      await prisma.booking.create({
        data: {
          orderId: order.id,
          orderNumber: orderNumber,
          celebrityId: celebrity.id,
          customerId: celebrity.userId,
          status: 'COMPLETED',
          approvalStatus: 'APPROVED',
          amount: paymentData.amount,
          celebrityAmount: Math.floor(paymentData.amount * 0.8),
          tipAmount: 0,
          totalEarnings: Math.floor(paymentData.amount * 0.8),
          requestedDate: paymentData.createdAt,
          deadline: new Date(paymentData.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000),
          instructions: 'Demo instructions',
          message: 'Demo message',
          recipientName: 'Demo Recipient',
          occasion: paymentData.occasion,
          createdAt: paymentData.createdAt,
          updatedAt: paymentData.createdAt
        }
      })
    }
    
    // Create dummy tips for some orders
    const tipsData = [
      { amount: 500, message: "Amazing video! Thank you!", orderIndex: 0 },
      { amount: 750, message: "Perfect for my daughter's birthday!", orderIndex: 1 },
      { amount: 300, message: "Love your work!", orderIndex: 2 },
      { amount: 1000, message: "Incredible performance!", orderIndex: 3 },
      { amount: 400, message: "Thank you so much!", orderIndex: 4 },
      { amount: 600, message: "You're the best!", orderIndex: 5 },
      { amount: 800, message: "Amazing talent!", orderIndex: 6 },
      { amount: 350, message: "Perfect timing!", orderIndex: 7 },
      { amount: 900, message: "Absolutely fantastic!", orderIndex: 8 },
      { amount: 450, message: "Thank you Emma!", orderIndex: 9 },
      { amount: 700, message: "Incredible video!", orderIndex: 10 },
      { amount: 550, message: "You made my day!", orderIndex: 11 },
    ]
    
    console.log('💰 Creating dummy tips...')
    for (const tipData of tipsData) {
      if (createdOrders[tipData.orderIndex]) {
        await prisma.tip.create({
          data: {
            celebrityId: celebrity.id,
            orderId: createdOrders[tipData.orderIndex].id,
            amount: tipData.amount,
            message: tipData.message,
            createdAt: createdOrders[tipData.orderIndex].createdAt,
            updatedAt: createdOrders[tipData.orderIndex].createdAt
          }
        })
      }
    }
    
    console.log('✅ Dummy data created successfully!')
    console.log(`   📊 Created ${tipsData.length} tips`)
    console.log(`   💰 Created ${paymentsData.length} payments`)
    console.log('')
    console.log('🎯 Now you can test the PDF export functionality:')
    console.log('   1. Go to the Payments tab in Emma\'s dashboard')
    console.log('   2. Click the PDF buttons to see charts with dummy data')
    
  } catch (error) {
    console.error('❌ Error creating dummy data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDummyData().then(() => process.exit(0)).catch(() => process.exit(1))
