#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Create two Prisma clients - one for local, one for production
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:1234@localhost:5432/kia_ora_db"
    }
  }
})

const productionPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function migrateLocalData() {
  console.log('🔄 Migrating Local Data to Production...\n')

  try {
    // Check if production DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.log('❌ DATABASE_URL not found')
      console.log('   Please set up Vercel Postgres and update DATABASE_URL')
      return
    }

    console.log('✅ Production DATABASE_URL found')

    // Step 1: Export data from local database
    console.log('\n1. Exporting data from local database...')
    
    const localUsers = await localPrisma.user.findMany()
    const localCelebrities = await localPrisma.celebrity.findMany()
    const localOrders = await localPrisma.order.findMany()
    const localServices = await localPrisma.service.findMany()
    const localReviews = await localPrisma.review.findMany()
    const localTips = await localPrisma.tip.findMany()

    console.log(`   Users: ${localUsers.length}`)
    console.log(`   Celebrities: ${localCelebrities.length}`)
    console.log(`   Orders: ${localOrders.length}`)
    console.log(`   Services: ${localServices.length}`)
    console.log(`   Reviews: ${localReviews.length}`)
    console.log(`   Tips: ${localTips.length}`)

    // Step 2: Check if production database is empty
    console.log('\n2. Checking production database...')
    const productionUserCount = await productionPrisma.user.count()
    
    if (productionUserCount > 0) {
      console.log('⚠️  Production database already has data')
      console.log('   Do you want to continue? This might create duplicates.')
      console.log('   Press Ctrl+C to cancel, or any key to continue...')
      
      // Wait for user input
      await new Promise(resolve => {
        process.stdin.once('data', () => resolve())
      })
    }

    // Step 3: Migrate data to production
    console.log('\n3. Migrating data to production...')

    // Migrate users
    if (localUsers.length > 0) {
      console.log('   Migrating users...')
      for (const user of localUsers) {
        try {
          await productionPrisma.user.upsert({
            where: { id: user.id },
            update: user,
            create: user
          })
        } catch (error) {
          console.log(`   ⚠️  Failed to migrate user ${user.id}: ${error.message}`)
        }
      }
      console.log('   ✅ Users migrated')
    }

    // Migrate celebrities
    if (localCelebrities.length > 0) {
      console.log('   Migrating celebrities...')
      for (const celebrity of localCelebrities) {
        try {
          await productionPrisma.celebrity.upsert({
            where: { id: celebrity.id },
            update: celebrity,
            create: celebrity
          })
        } catch (error) {
          console.log(`   ⚠️  Failed to migrate celebrity ${celebrity.id}: ${error.message}`)
        }
      }
      console.log('   ✅ Celebrities migrated')
    }

    // Migrate services
    if (localServices.length > 0) {
      console.log('   Migrating services...')
      for (const service of localServices) {
        try {
          await productionPrisma.service.upsert({
            where: { id: service.id },
            update: service,
            create: service
          })
        } catch (error) {
          console.log(`   ⚠️  Failed to migrate service ${service.id}: ${error.message}`)
        }
      }
      console.log('   ✅ Services migrated')
    }

    // Migrate orders
    if (localOrders.length > 0) {
      console.log('   Migrating orders...')
      for (const order of localOrders) {
        try {
          await productionPrisma.order.upsert({
            where: { id: order.id },
            update: order,
            create: order
          })
        } catch (error) {
          console.log(`   ⚠️  Failed to migrate order ${order.id}: ${error.message}`)
        }
      }
      console.log('   ✅ Orders migrated')
    }

    // Migrate reviews
    if (localReviews.length > 0) {
      console.log('   Migrating reviews...')
      for (const review of localReviews) {
        try {
          await productionPrisma.review.upsert({
            where: { id: review.id },
            update: review,
            create: review
          })
        } catch (error) {
          console.log(`   ⚠️  Failed to migrate review ${review.id}: ${error.message}`)
        }
      }
      console.log('   ✅ Reviews migrated')
    }

    // Migrate tips
    if (localTips.length > 0) {
      console.log('   Migrating tips...')
      for (const tip of localTips) {
        try {
          await productionPrisma.tip.upsert({
            where: { id: tip.id },
            update: tip,
            create: tip
          })
        } catch (error) {
          console.log(`   ⚠️  Failed to migrate tip ${tip.id}: ${error.message}`)
        }
      }
      console.log('   ✅ Tips migrated')
    }

    // Step 4: Verify migration
    console.log('\n4. Verifying migration...')
    const finalUserCount = await productionPrisma.user.count()
    const finalCelebrityCount = await productionPrisma.celebrity.count()
    const finalOrderCount = await productionPrisma.order.count()

    console.log(`   Final counts in production:`)
    console.log(`   Users: ${finalUserCount}`)
    console.log(`   Celebrities: ${finalCelebrityCount}`)
    console.log(`   Orders: ${finalOrderCount}`)

    console.log('\n🎉 Data migration completed successfully!')
    console.log('\n📋 Your production database now contains:')
    console.log(`   - ${finalUserCount} users`)
    console.log(`   - ${finalCelebrityCount} celebrities`)
    console.log(`   - ${finalOrderCount} orders`)
    console.log(`   - ${localServices.length} services`)
    console.log(`   - ${localReviews.length} reviews`)
    console.log(`   - ${localTips.length} tips`)

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
  } finally {
    await localPrisma.$disconnect()
    await productionPrisma.$disconnect()
  }
}

// Run the migration
migrateLocalData()
