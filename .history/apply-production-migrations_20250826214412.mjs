import { execSync } from 'child_process'
import { writeFileSync, unlinkSync } from 'fs'

async function applyProductionMigrations() {
  try {
    console.log('🚀 Applying migrations to production database...')
    
    // Create a temporary .env file with production database URL
    const tempEnvContent = `
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XNjN0WUZkZ2tPb0ljeTFveVhRaVMiLCJhcGlfa2V5IjoiMDFLMzhaOFc2VEJKQVRBWVM1M0VTNFFUMjciLCJ0ZW5hbnRfaWQiOiI5N2UxMGE4MDRiMzcxNDEzYjJhZGZhZjdhYzViMzFkMjhmY2FjYjAzZWZkNWMyOTNhYWZiYmY4NzBhYmNlN2FhIiwiaW50ZXJuYWxfc2VjcmV0IjoiZjI3ZTQyNmItZjY2NS00ZDI1LWE4OGEtM2E1NTgwMmIyODVmIn0.F7jaLciHEiq3GPE1CANg51wLP6FdxMQCYiCTHSQwdcY"
`
    
    writeFileSync('.env.production', tempEnvContent)
    
    try {
      // Apply migrations to production database
      console.log('📊 Applying migrations to production database...')
      execSync('npx prisma migrate deploy --schema=./prisma/schema.prisma', {
        env: { ...process.env, DATABASE_URL: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XNjN0WUZkZ2tPb0ljeTFveVhRaVMiLCJhcGlfa2V5IjoiMDFLMzhaOFc2VEJKQVRBWVM1M0VTNFFUMjciLCJ0ZW5hbnRfaWQiOiI5N2UxMGE4MDRiMzcxNDEzYjJhZGZhZjdhYzViMzFkMjhmY2FjYjAzZWZkNWMyOTNhYWZiYmY4NzBhYmNlN2FhIiwiaW50ZXJuYWxfc2VjcmV0IjoiZjI3ZTQyNmItZjY2NS00ZDI1LWE4OGEtM2E1NTgwMmIyODVmIn0.F7jaLciHEiq3GPE1CANg51wLP6FdxMQCYiCTHSQwdcY" },
        stdio: 'inherit'
      })
      
      console.log('✅ Migrations applied successfully to production database')
      
      // Generate Prisma client for production
      console.log('📊 Generating Prisma client for production...')
      execSync('npx prisma generate --schema=./prisma/schema.prisma', {
        env: { ...process.env, DATABASE_URL: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XNjN0WUZkZ2tPb0ljeTFveVhRaVMiLCJhcGlfa2V5IjoiMDFLMzhaOFc2VEJKQVRBWVM1M0VTNFFUMjciLCJ0ZW5hbnRfaWQiOiI5N2UxMGE4MDRiMzcxNDEzYjJhZGZhZjdhYzViMzFkMjhmY2FjYjAzZWZkNWMyOTNhYWZiYmY4NzBhYmNlN2FhIiwiaW50ZXJuYWxfc2VjcmV0IjoiZjI3ZTQyNmItZjY2NS00ZDI1LWE4OGEtM2E1NTgwMmIyODVmIn0.F7jaLciHEiq3GPE1CANg51wLP6FdxMQCYiCTHSQwdcY" },
        stdio: 'inherit'
      })
      
      console.log('✅ Prisma client generated successfully')
      
    } catch (error) {
      console.error('❌ Error applying migrations:', error.message)
      
      // If migrations fail, try to apply the specific migration manually
      console.log('🔄 Trying alternative approach...')
      
      const { PrismaClient } = await import('@prisma/client')
      
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XNjN0WUZkZ2tPb0ljeTFveVhRaVMiLCJhcGlfa2V5IjoiMDFLMzhaOFc2VEJKQVRBWVM1M0VTNFFUMjciLCJ0ZW5hbnRfaWQiOiI5N2UxMGE4MDRiMzcxNDEzYjJhZGZhZjdhYzViMzFkMjhmY2FjYjAzZWZkNWMyOTNhYWZiYmY4NzBhYmNlN2FhIiwiaW50ZXJuYWxfc2VjcmV0IjoiZjI3ZTQyNmItZjY2NS00ZDI1LWE4OGEtM2E1NTgwMmIyODVmIn0.F7jaLciHEiq3GPE1CANg51wLP6FdxMQCYiCTHSQwdcY"
          }
        }
      })
      
      try {
        // Check if the migration has already been applied
        const migrationHistory = await prisma.$queryRaw`
          SELECT * FROM "_prisma_migrations" 
          WHERE migration_name = '20250826144222_add_admin_stripe_account_and_platform_fee_transfers'
        `
        
        if (migrationHistory && migrationHistory.length > 0) {
          console.log('✅ Migration already applied to production database')
        } else {
          console.log('❌ Migration not found in production database')
          console.log('📝 You may need to manually apply the migration through the Prisma Data Platform dashboard')
        }
        
        await prisma.$disconnect()
      } catch (dbError) {
        console.error('❌ Error checking migration status:', dbError.message)
        await prisma.$disconnect()
      }
    }
    
  } catch (error) {
    console.error('❌ Error in migration process:', error)
  } finally {
    // Clean up temporary file
    try {
      unlinkSync('.env.production')
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

applyProductionMigrations()
