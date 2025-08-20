import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createOrders() {
  try {
    console.log('🔄 Creating Sample Orders...')
    
    // Get existing users and celebrities
    const users = await prisma.user.findMany({ where: { role: 'FAN' } })
    const celebrities = await prisma.celebrity.findMany()
    
    console.log('📊 Found users:', users.length)
    console.log('📊 Found celebrities:', celebrities.length)
    
    if (users.length === 0 || celebrities.length === 0) {
      console.log('❌ Need at least one user and one celebrity to create orders')
      return
    }
    
    // Create sample orders
    const order1 = await prisma.order.create({
      data: {
        userId: users[0].id,
        celebrityId: celebrities[0].id,
        totalAmount: 5000,
        celebrityAmount: 4000,
        platformFee: 1000,
        paymentStatus: 'SUCCEEDED',
        orderNumber: 'ORD-001',
        recipientName: 'Sarah Johnson',
        occasion: 'Birthday',
        personalMessage: 'Happy Birthday! Hope you have an amazing day filled with joy and laughter.',
        messageType: 'personal',
        email: users[0].email,
        booking: {
          create: {
            orderNumber: 'ORD-001',
            status: 'CONFIRMED',
            message: 'Happy Birthday!',
            specialInstructions: 'Please mention my name Sarah'
          }
        }
      }
    })
    
    const order2 = await prisma.order.create({
      data: {
        userId: users.length > 1 ? users[1].id : users[0].id,
        celebrityId: celebrities.length > 1 ? celebrities[1].id : celebrities[0].id,
        totalAmount: 7500,
        celebrityAmount: 6000,
        platformFee: 1500,
        paymentStatus: 'SUCCEEDED',
        orderNumber: 'ORD-002',
        recipientName: 'Mike Wilson',
        occasion: 'Graduation',
        personalMessage: 'Congratulations on your graduation! Your hard work and dedication have paid off.',
        messageType: 'personal',
        email: users.length > 1 ? users[1].email : users[0].email,
        booking: {
          create: {
            orderNumber: 'ORD-002',
            status: 'COMPLETED',
            message: 'Congratulations on your graduation!',
            specialInstructions: 'Make it personal and inspiring'
          }
        }
      }
    })
    
    const order3 = await prisma.order.create({
      data: {
        userId: users[0].id,
        celebrityId: celebrities.length > 2 ? celebrities[2].id : celebrities[0].id,
        totalAmount: 6000,
        celebrityAmount: 4800,
        platformFee: 1200,
        paymentStatus: 'PENDING',
        orderNumber: 'ORD-003',
        recipientName: 'Emily Davis',
        occasion: 'Get Well',
        personalMessage: 'Get well soon! Sending you lots of positive thoughts and healing energy.',
        messageType: 'personal',
        email: users[0].email,
        booking: {
          create: {
            status: 'PENDING',
            message: 'Get well soon message',
            specialInstructions: 'Make it encouraging and warm'
          }
        }
      }
    })
    
    console.log('✅ Sample orders created')
    
    // Final count
    const finalOrders = await prisma.order.count()
    const finalRevenue = await prisma.order.aggregate({
      where: { paymentStatus: "SUCCEEDED" },
      _sum: { totalAmount: true }
    })
    
    console.log('\n🎉 Orders Creation Complete!')
    console.log('📊 Final Counts:')
    console.log('Orders:', finalOrders)
    console.log('Total Revenue: $', finalRevenue._sum.totalAmount || 0)
    
  } catch (error) {
    console.error('❌ Error creating orders:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createOrders()
