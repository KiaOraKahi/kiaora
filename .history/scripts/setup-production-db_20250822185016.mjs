#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function setupProductionDatabase() {
  console.log('🗄️ Setting up Production Database...\n')

  try {
    // Step 1: Check if DATABASE_URL is set
    console.log('1. Checking environment variables...')
    const databaseUrl = process.env.DATABASE_URL
    
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL not found in environment variables')
      console.log('   Please set up Vercel Postgres and update DATABASE_URL')
      return
    }

    console.log('✅ DATABASE_URL found')
    console.log(`   Database: ${databaseUrl.split('@')[1]?.split('/')[0] || 'Unknown'}`)

    // Step 2: Generate Prisma client
    console.log('\n2. Generating Prisma client...')
    try {
      execSync('npx prisma generate', { stdio: 'inherit' })
      console.log('✅ Prisma client generated')
    } catch (error) {
      console.log('❌ Failed to generate Prisma client')
      return
    }

    // Step 3: Push schema to production database
    console.log('\n3. Applying database schema...')
    try {
      execSync('npx prisma db push', { stdio: 'inherit' })
      console.log('✅ Database schema applied successfully')
    } catch (error) {
      console.log('❌ Failed to apply database schema')
      console.log('   Make sure your DATABASE_URL is correct and database is accessible')
      return
    }

    // Step 4: Verify database connection
    console.log('\n4. Verifying database connection...')
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
        console.log('⚠️  Database is empty - you may need to migrate data from local database')
      }
    } catch (error) {
      console.log('❌ Failed to check existing data')
      console.log('   Error:', error.message)
    }

    console.log('\n🎉 Production database setup complete!')
    console.log('\n📋 Next steps:')
    console.log('1. Set up Google OAuth for authentication')
    console.log('2. Create Vercel Blob storage for file uploads')
    console.log('3. Configure email settings')
    console.log('4. Test your application')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the setup
setupProductionDatabase()
