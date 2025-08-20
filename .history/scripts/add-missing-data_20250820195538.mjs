import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function addMissingData() {
  try {
    console.log('🔄 Adding Missing Data...')
    
    // Get existing users
    const existingUsers = await prisma.user.findMany()
    console.log('📊 Existing users:', existingUsers.length)
    
    // Find or create sample users
    let user1 = existingUsers.find(u => u.email === 'john@example.com')
    let user2 = existingUsers.find(u => u.email === 'jane@example.com')
    
    if (!user1) {
      user1 = await prisma.user.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          password: await bcrypt.hash('password123', 10),
          role: 'FAN'
        }
      })
      console.log('✅ Created user1:', user1.email)
    }
    
    if (!user2) {
      user2 = await prisma.user.create({
        data: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: await bcrypt.hash('password123', 10),
          role: 'FAN'
        }
      })
      console.log('✅ Created user2:', user2.email)
    }
    
    // Create celebrity users
    console.log('\n🎭 Creating celebrity users...')
    const celebUser1 = await prisma.user.create({
      data: {
        name: 'Emma Stone',
        email: 'emma@celebrity.com',
        password: await bcrypt.hash('celebrity123', 10),
        role: 'CELEBRITY'
      }
    })
    
    const celebUser2 = await prisma.user.create({
      data: {
        name: 'Tom Hanks',
        email: 'tom@celebrity.com',
        password: await bcrypt.hash('celebrity123', 10),
        role: 'CELEBRITY'
      }
    })
    
    const celebUser3 = await prisma.user.create({
      data: {
        name: 'Jennifer Lawrence',
        email: 'jennifer@celebrity.com',
        password: await bcrypt.hash('celebrity123', 10),
        role: 'CELEBRITY'
      }
    })
    
    console.log('✅ Celebrity users created')
    
    // Create celebrities
    console.log('\n👑 Creating celebrities...')
    const celebrity1 = await prisma.celebrity.create({
      data: {
        userId: celebUser1.id,
        bio: 'Academy Award-winning actress',
        price: 5000,
        isActive: true,
        category: 'Actress'
      }
    })
    
    const celebrity2 = await prisma.celebrity.create({
      data: {
        userId: celebUser2.id,
        bio: 'Beloved actor and filmmaker',
        price: 7500,
        isActive: true,
        category: 'Actor'
      }
    })
    
    const celebrity3 = await prisma.celebrity.create({
      data: {
        userId: celebUser3.id,
        bio: 'Academy Award-winning actress',
        price: 6000,
        isActive: true,
        category: 'Actress'
      }
    })
    
    console.log('✅ Celebrities created')
    
    // Create sample orders
    console.log('\n📦 Creating sample orders...')
    const order1 = await prisma.order.create({
      data: {
        userId: user1.id,
        celebrityId: celebrity1.id,
        totalAmount: 5000,
        celebrityAmount: 4000,
        platformFee: 1000,
        paymentStatus: 'SUCCEEDED',
        orderNumber: 'ORD-001',
        recipientName: 'Sarah Johnson',
        booking: {
          create: {
            status: 'CONFIRMED',
            message: 'Happy Birthday!',
            specialInstructions: 'Please mention my name Sarah'
          }
        }
      }
    })
    
    const order2 = await prisma.order.create({
      data: {
        userId: user2.id,
        celebrityId: celebrity2.id,
        totalAmount: 7500,
        celebrityAmount: 6000,
        platformFee: 1500,
        paymentStatus: 'SUCCEEDED',
        orderNumber: 'ORD-002',
        recipientName: 'Mike Wilson',
        booking: {
          create: {
            status: 'COMPLETED',
            message: 'Congratulations on your graduation!',
            specialInstructions: 'Make it personal and inspiring'
          }
        }
      }
    })
    
    const order3 = await prisma.order.create({
      data: {
        userId: user1.id,
        celebrityId: celebrity3.id,
        totalAmount: 6000,
        celebrityAmount: 4800,
        platformFee: 1200,
        paymentStatus: 'PENDING',
        orderNumber: 'ORD-003',
        recipientName: 'Emily Davis',
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
    
    // Create settings if they don't exist
    console.log('\n⚙️ Creating settings...')
    const existingSettings = await prisma.siteSettings.findFirst()
    if (!existingSettings) {
      await prisma.siteSettings.create({
        data: {
          siteName: 'Kia Ora Kahi',
          siteDescription: 'Connect with celebrities for personalized video messages',
          contactEmail: 'admin@kiaora.com'
        }
      })
      console.log('✅ Site settings created')
    }
    
    const existingFinancialSettings = await prisma.financialSettings.findFirst()
    if (!existingFinancialSettings) {
      await prisma.financialSettings.create({
        data: {
          platformFee: 20,
          minimumPayout: 50,
          payoutSchedule: 'weekly'
        }
      })
      console.log('✅ Financial settings created')
    }
    
    // Final count
    const finalUsers = await prisma.user.count()
    const finalCelebrities = await prisma.celebrity.count()
    const finalOrders = await prisma.order.count()
    const finalRevenue = await prisma.order.aggregate({
      where: { paymentStatus: "SUCCEEDED" },
      _sum: { totalAmount: true }
    })
    
    console.log('\n🎉 Data Addition Complete!')
    console.log('📊 Final Counts:')
    console.log('Users:', finalUsers)
    console.log('Celebrities:', finalCelebrities)
    console.log('Orders:', finalOrders)
    console.log('Total Revenue: $', finalRevenue._sum.totalAmount || 0)
    
  } catch (error) {
    console.error('❌ Error adding data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addMissingData()
