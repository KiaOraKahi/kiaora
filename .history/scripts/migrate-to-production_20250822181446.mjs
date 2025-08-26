#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function migrateToProduction() {
  console.log('🚀 Kia Ora Production Migration Script\n')

  try {
    // Step 1: Check current environment
    console.log('1. Checking current environment...')
    const envPath = path.join(process.cwd(), '.env')
    const envExists = fs.existsSync(envPath)
    
    if (envExists) {
      console.log('✅ .env file found')
      const envContent = fs.readFileSync(envPath, 'utf8')
      const hasDatabaseUrl = envContent.includes('DATABASE_URL')
      console.log(`   Database URL configured: ${hasDatabaseUrl ? '✅' : '❌'}`)
    } else {
      console.log('❌ .env file not found')
    }

    // Step 2: Check database connection
    console.log('\n2. Testing database connection...')
    try {
      await prisma.$connect()
      console.log('✅ Database connection successful')
      
      // Get database info
      const result = await prisma.$queryRaw`SELECT current_database(), version()`
      console.log(`   Database: ${result[0].current_database}`)
      console.log(`   Version: ${result[0].version.split(' ')[0]}`)
    } catch (error) {
      console.log('❌ Database connection failed')
      console.log(`   Error: ${error.message}`)
      console.log('\n   Please ensure DATABASE_URL is set correctly')
      return
    }

    // Step 3: Check current data
    console.log('\n3. Analyzing current data...')
    
    const userCount = await prisma.user.count()
    const celebrityCount = await prisma.celebrity.count()
    const orderCount = await prisma.order.count()
    const applicationCount = await prisma.celebrityApplication.count()

    console.log(`   Users: ${userCount}`)
    console.log(`   Celebrities: ${celebrityCount}`)
    console.log(`   Orders: ${orderCount}`)
    console.log(`   Applications: ${applicationCount}`)

    // Step 4: Check schema status
    console.log('\n4. Checking schema status...')
    try {
      const migrations = await prisma.migration.findMany({
        orderBy: { startedAt: 'desc' },
        take: 5
      })
      
      console.log(`   Latest migrations:`)
      migrations.forEach(migration => {
        console.log(`   - ${migration.migration_name} (${migration.startedAt.toISOString().split('T')[0]})`)
      })
    } catch (error) {
      console.log('   No migrations found (using db push)')
    }

    // Step 5: Generate Prisma client
    console.log('\n5. Generating Prisma client...')
    try {
      execSync('npx prisma generate', { stdio: 'inherit' })
      console.log('✅ Prisma client generated successfully')
    } catch (error) {
      console.log('❌ Failed to generate Prisma client')
      console.log(`   Error: ${error.message}`)
    }

    // Step 6: Environment variables checklist
    console.log('\n6. Environment Variables Checklist:')
    
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'BLOB_READ_WRITE_TOKEN',
      'STRIPE_SECRET_KEY',
      'STRIPE_PUBLISHABLE_KEY',
      'STRIPE_WEBHOOK_SECRET'
    ]

    const envContent = envExists ? fs.readFileSync(envPath, 'utf8') : ''
    
    requiredEnvVars.forEach(envVar => {
      const isSet = envContent.includes(`${envVar}=`)
      console.log(`   ${envVar}: ${isSet ? '✅' : '❌'}`)
    })

    // Step 7: Production recommendations
    console.log('\n7. Production Recommendations:')
    console.log('   📊 Database:')
    console.log('   - Use Vercel Postgres for seamless integration')
    console.log('   - Enable connection pooling')
    console.log('   - Set up automated backups')
    
    console.log('\n   🔐 Security:')
    console.log('   - Rotate all secrets before production')
    console.log('   - Use strong NEXTAUTH_SECRET')
    console.log('   - Enable SSL for database connections')
    
    console.log('\n   📈 Performance:')
    console.log('   - Add database indexes for frequently queried fields')
    console.log('   - Implement proper caching strategies')
    console.log('   - Monitor database performance')

    // Step 8: Migration commands
    console.log('\n8. Migration Commands:')
    console.log('   For Vercel deployment, run these commands:')
    console.log('   ```bash')
    console.log('   # Generate Prisma client')
    console.log('   npx prisma generate')
    console.log('   ')
    console.log('   # Push schema to production database')
    console.log('   npx prisma db push')
    console.log('   ')
    console.log('   # Or if using migrations')
    console.log('   npx prisma migrate deploy')
    console.log('   ```')

    // Step 9: Data backup recommendation
    if (userCount > 0 || celebrityCount > 0 || orderCount > 0) {
      console.log('\n9. Data Backup:')
      console.log('   ⚠️  You have existing data. Consider backing up before migration:')
      console.log('   ```bash')
      console.log('   # Export current data')
      console.log('   pg_dump your_local_db > backup.sql')
      console.log('   ')
      console.log('   # Import to production')
      console.log('   psql your_production_db < backup.sql')
      console.log('   ```')
    }

    console.log('\n✅ Migration analysis complete!')
    console.log('\n📋 Next Steps:')
    console.log('   1. Set up production database (Vercel Postgres recommended)')
    console.log('   2. Configure all environment variables in Vercel')
    console.log('   3. Deploy to Vercel')
    console.log('   4. Run database migration commands')
    console.log('   5. Test all functionality')
    console.log('   6. Set up monitoring and analytics')

  } catch (error) {
    console.error('❌ Migration analysis failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration analysis
migrateToProduction()
