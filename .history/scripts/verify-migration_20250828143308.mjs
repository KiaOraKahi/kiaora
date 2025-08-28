import { PrismaClient } from '@prisma/client'

const productionPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://f6b3594d231a10194416a318a056ea2946f16e73c093bca313bf296cc00343bf:sk_qcpY8_xIfgKD2qhKfZBra@db.prisma.io:5432/postgres?sslmode=require"
    }
  }
})

async function verifyMigration() {
  try {
    console.log('🔍 Verifying data migration to production database...')
    
    await productionPrisma.$connect()
    console.log('✅ Connected to production database')

    // Count all records
    const userCount = await productionPrisma.user.count()
    const celebrityCount = await productionPrisma.celebrity.count()
    const orderCount = await productionPrisma.order.count()
    const bookingCount = await productionPrisma.booking.count()
    const siteSettingsCount = await productionPrisma.siteSettings.count()
    const financialSettingsCount = await productionPrisma.financialSettings.count()

    console.log('\n📊 Production Database Summary:')
    console.log(`   👥 Users: ${userCount}`)
    console.log(`   🌟 Celebrities: ${celebrityCount}`)
    console.log(`   📦 Orders: ${orderCount}`)
    console.log(`   📅 Bookings: ${bookingCount}`)
    console.log(`   ⚙️  Site Settings: ${siteSettingsCount}`)
    console.log(`   💰 Financial Settings: ${financialSettingsCount}`)

    // Show some sample data
    console.log('\n👥 Sample Users:')
    const users = await productionPrisma.user.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`)
    })

    console.log('\n🌟 Sample Celebrities:')
    const celebrities = await productionPrisma.celebrity.findMany({
      take: 3,
      select: {
        id: true,
        userId: true,
        bio: true,
        price: true
      }
    })
    celebrities.forEach(celebrity => {
      console.log(`   - ID: ${celebrity.id}, Price: $${celebrity.price}`)
    })

    console.log('\n📦 Sample Orders:')
    const orders = await productionPrisma.order.findMany({
      take: 3,
      select: {
        orderNumber: true,
        totalAmount: true,
        status: true
      }
    })
    orders.forEach(order => {
      console.log(`   - ${order.orderNumber}: $${order.totalAmount} (${order.status})`)
    })

    console.log('\n✅ Migration verification completed!')

  } catch (error) {
    console.error('❌ Verification failed:', error)
  } finally {
    await productionPrisma.$disconnect()
  }
}

verifyMigration()
