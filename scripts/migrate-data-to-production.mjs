import { PrismaClient } from '@prisma/client'

// Local database connection (source)
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:1234@localhost:5432/kia_ora_db"
    }
  }
})

// Production database connection (destination)
const productionPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://f6b3594d231a10194416a318a056ea2946f16e73c093bca313bf296cc00343bf:sk_qcpY8_xIfgKD2qhKfZBra@db.prisma.io:5432/postgres?sslmode=require"
    }
  }
})

async function migrateDataToProduction() {
  try {
    console.log('🚀 Starting data migration from local to production database...')
    
    // Test connections
    console.log('🔍 Testing database connections...')
    await localPrisma.$connect()
    await productionPrisma.$connect()
    console.log('✅ Both database connections successful')

    // 1. Migrate Users
    console.log('\n👥 Migrating Users...')
    const users = await localPrisma.user.findMany({
      include: {
        accounts: true,
        sessions: true
      }
    })
    console.log(`   Found ${users.length} users to migrate`)

    for (const user of users) {
      try {
        // Check if user already exists
        const existingUser = await productionPrisma.user.findUnique({
          where: { email: user.email }
        })

        if (existingUser) {
          console.log(`   ⚠️  User ${user.email} already exists, skipping...`)
          continue
        }

        // Create user without accounts and sessions first
        const { accounts, sessions, ...userData } = user
        const newUser = await productionPrisma.user.create({
          data: userData
        })

        // Migrate accounts
        for (const account of accounts) {
          await productionPrisma.account.create({
            data: {
              ...account,
              userId: newUser.id
            }
          })
        }

        // Migrate sessions
        for (const session of sessions) {
          await productionPrisma.session.create({
            data: {
              ...session,
              userId: newUser.id
            }
          })
        }

        console.log(`   ✅ Migrated user: ${user.email}`)
      } catch (error) {
        console.log(`   ❌ Error migrating user ${user.email}:`, error.message)
      }
    }

    // 2. Migrate Celebrities
    console.log('\n🌟 Migrating Celebrities...')
    const celebrities = await localPrisma.celebrity.findMany({
      include: {
        sampleVideos: true
      }
    })
    console.log(`   Found ${celebrities.length} celebrities to migrate`)

    for (const celebrity of celebrities) {
      try {
        const { sampleVideos, ...celebrityData } = celebrity
        const newCelebrity = await productionPrisma.celebrity.create({
          data: celebrityData
        })

        // Migrate sample videos
        for (const video of sampleVideos) {
          await productionPrisma.sampleVideo.create({
            data: {
              ...video,
              celebrityId: newCelebrity.id
            }
          })
        }

        console.log(`   ✅ Migrated celebrity: ${celebrityData.userId}`)
      } catch (error) {
        console.log(`   ❌ Error migrating celebrity ${celebrity.userId}:`, error.message)
      }
    }

    // 3. Migrate Services
    console.log('\n🛍️  Migrating Services...')
    const services = await localPrisma.service.findMany({
      include: {
        features: true
      }
    })
    console.log(`   Found ${services.length} services to migrate`)

    for (const service of services) {
      try {
        const { features, ...serviceData } = service
        const newService = await productionPrisma.service.create({
          data: serviceData
        })

        // Migrate service features
        for (const feature of features) {
          await productionPrisma.serviceFeature.create({
            data: {
              ...feature,
              serviceId: newService.id
            }
          })
        }

        console.log(`   ✅ Migrated service: ${serviceData.title}`)
      } catch (error) {
        console.log(`   ❌ Error migrating service ${service.title}:`, error.message)
      }
    }

    // 4. Migrate Orders
    console.log('\n📦 Migrating Orders...')
    const orders = await localPrisma.order.findMany({
      include: {
        items: true
      }
    })
    console.log(`   Found ${orders.length} orders to migrate`)

    for (const order of orders) {
      try {
        const { items, ...orderData } = order
        const newOrder = await productionPrisma.order.create({
          data: orderData
        })

        // Migrate order items
        for (const item of items) {
          await productionPrisma.orderItem.create({
            data: {
              ...item,
              orderId: newOrder.id
            }
          })
        }

        console.log(`   ✅ Migrated order: ${orderData.orderNumber}`)
      } catch (error) {
        console.log(`   ❌ Error migrating order ${order.orderNumber}:`, error.message)
      }
    }

    // 5. Migrate Bookings
    console.log('\n📅 Migrating Bookings...')
    const bookings = await localPrisma.booking.findMany()
    console.log(`   Found ${bookings.length} bookings to migrate`)

    for (const booking of bookings) {
      try {
        await productionPrisma.booking.create({
          data: booking
        })
        console.log(`   ✅ Migrated booking: ${booking.orderNumber}`)
      } catch (error) {
        console.log(`   ❌ Error migrating booking ${booking.orderNumber}:`, error.message)
      }
    }

    // 6. Migrate Reviews
    console.log('\n⭐ Migrating Reviews...')
    const reviews = await localPrisma.review.findMany()
    console.log(`   Found ${reviews.length} reviews to migrate`)

    for (const review of reviews) {
      try {
        await productionPrisma.review.create({
          data: review
        })
        console.log(`   ✅ Migrated review: ${review.id}`)
      } catch (error) {
        console.log(`   ❌ Error migrating review ${review.id}:`, error.message)
      }
    }

    // 7. Migrate Tips
    console.log('\n💸 Migrating Tips...')
    const tips = await localPrisma.tip.findMany()
    console.log(`   Found ${tips.length} tips to migrate`)

    for (const tip of tips) {
      try {
        await productionPrisma.tip.create({
          data: tip
        })
        console.log(`   ✅ Migrated tip: ${tip.id}`)
      } catch (error) {
        console.log(`   ❌ Error migrating tip ${tip.id}:`, error.message)
      }
    }

    // 8. Migrate Site Content
    console.log('\n📝 Migrating Site Content...')
    const siteContent = await localPrisma.siteContent.findMany()
    console.log(`   Found ${siteContent.length} site content items to migrate`)

    for (const content of siteContent) {
      try {
        await productionPrisma.siteContent.create({
          data: content
        })
        console.log(`   ✅ Migrated site content: ${content.key}`)
      } catch (error) {
        console.log(`   ❌ Error migrating site content ${content.key}:`, error.message)
      }
    }

    // 9. Migrate Site Settings
    console.log('\n⚙️  Migrating Site Settings...')
    const siteSettings = await localPrisma.siteSettings.findMany()
    console.log(`   Found ${siteSettings.length} site settings to migrate`)

    for (const setting of siteSettings) {
      try {
        await productionPrisma.siteSettings.create({
          data: setting
        })
        console.log(`   ✅ Migrated site setting: ${setting.id}`)
      } catch (error) {
        console.log(`   ❌ Error migrating site setting ${setting.id}:`, error.message)
      }
    }

    // 10. Migrate Financial Settings
    console.log('\n💰 Migrating Financial Settings...')
    const financialSettings = await localPrisma.financialSettings.findMany()
    console.log(`   Found ${financialSettings.length} financial settings to migrate`)

    for (const setting of financialSettings) {
      try {
        await productionPrisma.financialSettings.create({
          data: setting
        })
        console.log(`   ✅ Migrated financial setting: ${setting.id}`)
      } catch (error) {
        console.log(`   ❌ Error migrating financial setting ${setting.id}:`, error.message)
      }
    }

    // 11. Migrate Support Tickets
    console.log('\n🎫 Migrating Support Tickets...')
    const supportTickets = await localPrisma.supportTicket.findMany({
      include: {
        responses: true
      }
    })
    console.log(`   Found ${supportTickets.length} support tickets to migrate`)

    for (const ticket of supportTickets) {
      try {
        const { responses, ...ticketData } = ticket
        const newTicket = await productionPrisma.supportTicket.create({
          data: ticketData
        })

        // Migrate ticket responses
        for (const response of responses) {
          await productionPrisma.supportTicketResponse.create({
            data: {
              ...response,
              ticketId: newTicket.id
            }
          })
        }

        console.log(`   ✅ Migrated support ticket: ${ticketData.ticketNumber}`)
      } catch (error) {
        console.log(`   ❌ Error migrating support ticket ${ticket.ticketNumber}:`, error.message)
      }
    }

    // 12. Migrate Celebrity Applications
    console.log('\n📋 Migrating Celebrity Applications...')
    const applications = await localPrisma.celebrityApplication.findMany()
    console.log(`   Found ${applications.length} celebrity applications to migrate`)

    for (const application of applications) {
      try {
        await productionPrisma.celebrityApplication.create({
          data: application
        })
        console.log(`   ✅ Migrated celebrity application: ${application.email}`)
      } catch (error) {
        console.log(`   ❌ Error migrating celebrity application ${application.email}:`, error.message)
      }
    }

    // 13. Migrate Platform Fee Transfers
    console.log('\n💳 Migrating Platform Fee Transfers...')
    const platformFeeTransfers = await localPrisma.platformFeeTransfer.findMany()
    console.log(`   Found ${platformFeeTransfers.length} platform fee transfers to migrate`)

    for (const transfer of platformFeeTransfers) {
      try {
        await productionPrisma.platformFeeTransfer.create({
          data: transfer
        })
        console.log(`   ✅ Migrated platform fee transfer: ${transfer.id}`)
      } catch (error) {
        console.log(`   ❌ Error migrating platform fee transfer ${transfer.id}:`, error.message)
      }
    }

    console.log('\n🎉 Data migration completed successfully!')
    console.log('📊 Summary:')
    console.log(`   - Users: ${users.length}`)
    console.log(`   - Celebrities: ${celebrities.length}`)
    console.log(`   - Services: ${services.length}`)
    console.log(`   - Orders: ${orders.length}`)
    console.log(`   - Bookings: ${bookings.length}`)
    console.log(`   - Reviews: ${reviews.length}`)
    console.log(`   - Tips: ${tips.length}`)
    console.log(`   - Site Content: ${siteContent.length}`)
    console.log(`   - Support Tickets: ${supportTickets.length}`)
    console.log(`   - Celebrity Applications: ${applications.length}`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await localPrisma.$disconnect()
    await productionPrisma.$disconnect()
  }
}

migrateDataToProduction()
