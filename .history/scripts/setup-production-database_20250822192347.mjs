#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

// Use the PRISMA_DATABASE_URL from Vercel (accelerated connection)
const productionDatabaseUrl = "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XNjN0WUZkZ2tPb0ljeTFveVhRaVMiLCJhcGlfa2V5IjoiMDFLMzhaOFc2VEJKQVRBWVM1M0VTNFFUMjciLCJ0ZW5hbnRfaWQiOiI5N2UxMGE4MDRiMzcxNDEzYjJhZGZhZjdhYzViMzFkMjhmY2FjYjAzZWZkNWMyOTNhYWZiYmY4NzBhYmNlN2FhIiwiaW50ZXJuYWxfc2VjcmV0IjoiZjI3ZTQyNmItZjY2NS00ZDI1LWE4OGEtM2E1NTgwMmIyODVmIn0.F7jaLciHEiq3GPE1CANg51wLP6FdxMQCYiCTHSQwdcY"

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: productionDatabaseUrl
    }
  }
})

async function setupProductionDatabase() {
  console.log('🚀 Setting up Production Database...\n')

  try {
    // Step 1: Test connection
    console.log('1. Testing database connection...')
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database connection successful!')

    // Step 2: Apply schema
    console.log('\n2. Applying database schema...')
    try {
      // Use the PRISMA_DATABASE_URL for schema push
      execSync(`PRISMA_DATABASE_URL="${productionDatabaseUrl}" npx prisma db push`, { stdio: 'inherit' })
      console.log('✅ Database schema applied successfully!')
    } catch (error) {
      console.log('❌ Failed to apply schema:', error.message)
      return
    }

    // Step 3: Check existing data
    console.log('\n3. Checking existing data...')
    try {
      const userCount = await prisma.user.count()
      const celebrityCount = await prisma.celebrity.count()
      const orderCount = await prisma.order.count()
      
      console.log(`   Users: ${userCount}`)
      console.log(`   Celebrities: ${celebrityCount}`)
      console.log(`   Orders: ${orderCount}`)
      
      if (userCount === 0) {
        console.log('⚠️  Production database is empty')
        console.log('   Ready to migrate data from local database')
      } else {
        console.log('✅ Production database has data')
      }
    } catch (error) {
      console.log('⚠️  Error checking data:', error.message)
    }

    console.log('\n🎉 Production database setup complete!')
    console.log('\n📋 Next steps:')
    console.log('1. Migrate local data to production')
    console.log('2. Test your application')
    console.log('3. Deploy to Vercel')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Check if database was created properly')
    console.log('2. Verify connection string is correct')
    console.log('3. Make sure database is accessible')
  } finally {
    await prisma.$disconnect()
  }
}

// Run the setup
setupProductionDatabase()
