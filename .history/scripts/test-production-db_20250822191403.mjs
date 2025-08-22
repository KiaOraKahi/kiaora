#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

// Test with the production database URL
const productionDatabaseUrl = "postgres://97e10a804b371413b2adfaf7ac5b31d28fcacb03efd5c293aafbbf870abce7aa:sk_W63tYFdgkOoIcy1oyXQiS@db.prisma.io:5432/?sslmode=require"

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: productionDatabaseUrl
    }
  }
})

async function testProductionDatabase() {
  console.log('🧪 Testing Production Database Connection...\n')

  try {
    // Step 1: Test connection
    console.log('1. Testing database connection...')
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database connection successful!')

    // Step 2: Check if tables exist
    console.log('\n2. Checking database schema...')
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log(`✅ Found ${tables.length} tables in database`)

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
      console.log('⚠️  Tables might not exist yet - need to apply schema')
    }

    console.log('\n🎉 Production database test completed!')
    console.log('\n📋 Next steps:')
    console.log('1. Apply database schema')
    console.log('2. Migrate local data')
    console.log('3. Deploy to Vercel')

  } catch (error) {
    console.error('❌ Database test failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Check if database was created properly')
    console.log('2. Verify connection string is correct')
    console.log('3. Make sure database is accessible')
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testProductionDatabase()
