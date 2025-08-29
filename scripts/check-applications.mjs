import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function checkApplications() {
  try {
    console.log('🔍 Checking for celebrity applications...')
    
    const applications = await prisma.celebrityApplication.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`\n📊 Total applications found: ${applications.length}`)
    
    if (applications.length === 0) {
      console.log('❌ No applications found in the database')
      return
    }
    
    console.log('\n📋 Applications:')
    applications.forEach((app, index) => {
      console.log(`\n${index + 1}. ${app.fullName}`)
      console.log(`   Email: ${app.email}`)
      console.log(`   Status: ${app.status}`)
      console.log(`   Created: ${app.createdAt}`)
      console.log(`   Category: ${app.category}`)
      console.log(`   Profession: ${app.profession}`)
    })
    
    // Check status distribution
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    }, {})
    
    console.log('\n📈 Status Distribution:')
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`)
    })
    
  } catch (error) {
    console.error('❌ Error checking applications:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkApplications()
