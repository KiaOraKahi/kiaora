#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

async function setupPrismaPostgres() {
  console.log('🚀 Setting up Prisma Postgres Production Database...\n')

  try {
    // Step 1: Check environment
    console.log('1. Checking environment...')
    const databaseUrl = process.env.DATABASE_URL
    
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL not found')
      console.log('   Please create Prisma Postgres in Vercel first')
      console.log('   Then update your environment variables')
      return
    }

    console.log('✅ DATABASE_URL found')
    
    // Check if it's a Vercel Prisma Postgres URL
    if (databaseUrl.includes('vercel-storage.com')) {
      console.log('✅ Vercel Prisma Postgres detected')
    } else {
      console.log('⚠️  Not a Vercel Prisma Postgres URL')
    }

    // Step 2: Generate Prisma client
    console.log('\n2. Generating Prisma client...')
    try {
      execSync('npx prisma generate', { stdio: 'inherit' })
      console.log('✅ Prisma client generated')
    } catch (error) {
      console.log('❌ Failed to generate Prisma client')
      return
    }

    // Step 3: Push schema to production
    console.log('\n3. Applying schema to production database...')
    try {
      execSync('npx prisma db push', { stdio: 'inherit' })
      console.log('✅ Schema applied successfully')
    } catch (error) {
      console.log('❌ Failed to apply schema')
      console.log('   Make sure your DATABASE_URL is correct')
      return
    }

    // Step 4: Test connection
    console.log('\n4. Testing database connection...')
    try {
      const result = await prisma.$queryRaw`SELECT 1 as test`
      console.log('✅ Database connection successful')
    } catch (error) {
      console.log('❌ Database connection failed')
      console.log('   Error:', error.message)
      return
    }

    // Step 5: Check existing data
    console.log('\n5. Checking existing data...')
    try {
      const userCount = await prisma.user.count()
      const celebrityCount = await prisma.celebrity.count()
      const orderCount = await prisma.order.count()
      
      console.log(`   Users: ${userCount}`)
      console.log(`   Celebrities: ${celebrityCount}`)
      console.log(`   Orders: ${orderCount}`)
      
      if (userCount === 0) {
        console.log('⚠️  Production database is empty')
        console.log('   Run the migration script to copy data from local database')
      }
    } catch (error) {
      console.log('❌ Failed to check data')
      console.log('   Error:', error.message)
    }

    console.log('\n🎉 Prisma Postgres setup complete!')
    console.log('\n📋 Next steps:')
    console.log('1. Set up Google OAuth for authentication')
    console.log('2. Create Vercel Blob storage for file uploads')
    console.log('3. Configure email settings')
    console.log('4. Test your application')
    
    if (userCount === 0) {
      console.log('\n🔄 To migrate your local data:')
      console.log('   node scripts/migrate-local-data.mjs')
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the setup
setupPrismaPostgres()
