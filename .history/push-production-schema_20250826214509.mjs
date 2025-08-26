import { execSync } from 'child_process'

async function pushProductionSchema() {
  try {
    console.log('🚀 Pushing schema to production database...')
    
    // Set the production database URL
    const productionDbUrl = "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XNjN0WUZkZ2tPb0ljeTFveVhRaVMiLCJhcGlfa2V5IjoiMDFLMzhaOFc2VEJKQVRBWVM1M0VTNFFUMjciLCJ0ZW5hbnRfaWQiOiI5N2UxMGE4MDRiMzcxNDEzYjJhZGZhZjdhYzViMzFkMjhmY2FjYjAzZWZkNWMyOTNhYWZiYmY4NzBhYmNlN2FhIiwiaW50ZXJuYWxfc2VjcmV0IjoiZjI3ZTQyNmItZjY2NS00ZDI1LWE4OGEtM2E1NTgwMmIyODVmIn0.F7jaLciHEiq3GPE1CANg51wLP6FdxMQCYiCTHSQwdcY"
    
    console.log('📊 Using production database URL')
    
    // Push schema to production database
    execSync('npx prisma db push --accept-data-loss --schema=./prisma/schema.prisma', {
      env: { ...process.env, DATABASE_URL: productionDbUrl },
      stdio: 'inherit'
    })
    
    console.log('✅ Schema pushed successfully to production database')
    
    // Generate Prisma client
    console.log('📊 Generating Prisma client...')
    execSync('npx prisma generate --schema=./prisma/schema.prisma', {
      env: { ...process.env, DATABASE_URL: productionDbUrl },
      stdio: 'inherit'
    })
    
    console.log('✅ Prisma client generated successfully')
    
    console.log('🎉 Production database schema updated successfully!')
    
  } catch (error) {
    console.error('❌ Error pushing schema to production:', error.message)
  }
}

pushProductionSchema()
