#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'

// Local database client
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:1234@localhost:5432/kia_ora_db"
    }
  }
})

// Production database client
const productionPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XNjN0WUZkZ2tPb0ljeTFveVhRaVMiLCJhcGlfa2V5IjoiMDFLMzhaOFc2VEJKQVRBWVM1M0VTNFFUMjciLCJ0ZW5hbnRfaWQiOiI5N2UxMGE4MDRiMzcxNDEzYjJhZGZhZjdhYzViMzFkMjhmY2FjYjAzZWZkNWMyOTNhYWZiYmY4NzBhYmNlN2FhIiwiaW50ZXJuYWxfc2VjcmV0IjoiZjI3ZTQyNmItZjY2NS00ZDI1LWE4OGEtM2E1NTgwMmIyODVmIn0.F7jaLciHEiq3GPE1CANg51wLP6FdxMQCYiCTHSQwdcY"
    }
  }
})

async function migrateData() {
  console.log('🔄 Migrating Data to Production...\n')

  try {
    // Export from local
    console.log('1. Exporting from local database...')
    const users = await localPrisma.user.findMany()
    const celebrities = await localPrisma.celebrity.findMany()
    const orders = await localPrisma.order.findMany()
    
    console.log(`   Found: ${users.length} users, ${celebrities.length} celebrities, ${orders.length} orders`)

    // Import to production
    console.log('\n2. Importing to production...')
    
    for (const user of users) {
      await productionPrisma.user.create({ data: user })
    }
    console.log(`   ✅ ${users.length} users migrated`)

    for (const celebrity of celebrities) {
      await productionPrisma.celebrity.create({ data: celebrity })
    }
    console.log(`   ✅ ${celebrities.length} celebrities migrated`)

    for (const order of orders) {
      await productionPrisma.order.create({ data: order })
    }
    console.log(`   ✅ ${orders.length} orders migrated`)

    console.log('\n🎉 Data migration completed!')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
  } finally {
    await localPrisma.$disconnect()
    await productionPrisma.$disconnect()
  }
}

migrateData()
