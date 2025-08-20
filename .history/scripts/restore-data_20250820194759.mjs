import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function restoreData() {
  try {
    console.log('🔄 Restoring Database Data...')
    
    // Create admin user
    console.log('\n👤 Creating admin user...')
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@kiaora.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    console.log('✅ Admin user created:', adminUser.email)
    
    // Create some sample users
    console.log('\n👥 Creating sample users...')
    const user1 = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'FAN'
      }
    })
    
    const user2 = await prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'FAN'
      }
    })
    
    console.log('✅ Sample users created')
    
    // Create celebrities
    console.log('\n👑 Creating celebrities...')
    const celebrity1 = await prisma.celebrity.create({
      data: {
        name: 'Emma Stone',
        bio: 'Academy Award-winning actress',
        price: 5000,
        isActive: true,
        imageUrl: '/celebrities/emma-stone.jpg'
      }
    })
    
    const celebrity2 = await prisma.celebrity.create({
      data: {
        name: 'Tom Hanks',
        bio: 'Beloved actor and filmmaker',
        price: 7500,
        isActive: true,
        imageUrl: '/celebrities/tom-hanks.jpg'
      }
    })
    
    const celebrity3 = await prisma.celebrity.create({
      data: {
        name: 'Jennifer Lawrence',
        bio: 'Academy Award-winning actress',
        price: 6000,
        isActive: true,
        imageUrl: '/celebrities/jennifer-lawrence.jpg'
      }
    })
    
    console.log('✅ Celebrities created')
    
    // Create celebrity users
    console.log('\n🎭 Creating celebrity users...')
    const celebUser1 = await prisma.user.create({
      data: {
        name: 'Emma Stone',
        email: 'emma@celebrity.com',
        password: await bcrypt.hash('celebrity123', 10),
        role: 'CELEBRITY',
        celebrityProfile: {
          create: {
            celebrityId: celebrity1.id
          }
        }
      }
    })
    
    const celebUser2 = await prisma.user.create({
      data: {
        name: 'Tom Hanks',
        email: 'tom@celebrity.com',
        password: await bcrypt.hash('celebrity123', 10),
        role: 'CELEBRITY',
        celebrityProfile: {
          create: {
            celebrityId: celebrity2.id
          }
        }
      }
    })
    
    console.log('✅ Celebrity users created')
    
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
    
    // Create settings
    console.log('\n⚙️ Creating settings...')
    await prisma.siteSettings.create({
      data: {
        siteName: 'Kia Ora Kahi',
        siteDescription: 'Connect with celebrities for personalized video messages',
        contactEmail: 'admin@kiaora.com'
      }
    })
    
    await prisma.financialSettings.create({
      data: {
        platformFee: 20,
        minimumPayout: 50,
        payoutSchedule: 'weekly'
      }
    })
    
    console.log('✅ Settings created')
    
    // Final count
    const finalUsers = await prisma.user.count()
    const finalCelebrities = await prisma.celebrity.count()
    const finalOrders = await prisma.order.count()
    const finalRevenue = await prisma.order.aggregate({
      where: { paymentStatus: "SUCCEEDED" },
      _sum: { totalAmount: true }
    })
    
    console.log('\n🎉 Data Restoration Complete!')
    console.log('📊 Final Counts:')
    console.log('Users:', finalUsers)
    console.log('Celebrities:', finalCelebrities)
    console.log('Orders:', finalOrders)
    console.log('Total Revenue: $', finalRevenue._sum.totalAmount || 0)
    
    console.log('\n🔑 Admin Login:')
    console.log('Email: admin@kiaora.com')
    console.log('Password: admin123')
    
  } catch (error) {
    console.error('❌ Error restoring data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

restoreData()
