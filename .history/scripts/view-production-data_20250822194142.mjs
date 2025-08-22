#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'

// Production database client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XNjN0WUZkZ2tPb0ljeTFveVhRaVMiLCJhcGlfa2V5IjoiMDFLMzhaOFc2VEJKQVRBWVM1M0VTNFFUMjciLCJ0ZW5hbnRfaWQiOiI5N2UxMGE4MDRiMzcxNDEzYjJhZGZhZjdhYzViMzFkMjhmY2FjYjAzZWZkNWMyOTNhYWZiYmY4NzBhYmNlN2FhIiwiaW50ZXJuYWxfc2VjcmV0IjoiZjI3ZTQyNmItZjY2NS00ZDI1LWE4OGEtM2E1NTgwMmIyODVmIn0.F7jaLciHEiq3GPE1CANg51wLP6FdxMQCYiCTHSQwdcY"
    }
  }
})

async function viewProductionData() {
  console.log('🔍 Viewing Production Database Data...\n')

  try {
    // Check all tables
    console.log('📊 Database Summary:')
    
    const userCount = await prisma.user.count()
    const celebrityCount = await prisma.celebrity.count()
    const orderCount = await prisma.order.count()
    const serviceCount = await prisma.service.count()
    const reviewCount = await prisma.review.count()
    const tipCount = await prisma.tip.count()
    
    console.log(`   👥 Users: ${userCount}`)
    console.log(`   ⭐ Celebrities: ${celebrityCount}`)
    console.log(`   📦 Orders: ${orderCount}`)
    console.log(`   🛠️  Services: ${serviceCount}`)
    console.log(`   💬 Reviews: ${reviewCount}`)
    console.log(`   💰 Tips: ${tipCount}`)

    // Show recent users
    if (userCount > 0) {
      console.log('\n👥 Recent Users:')
      const users = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isVerified: true,
          createdAt: true
        }
      })
      
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role} - ${user.isVerified ? '✅ Verified' : '❌ Not Verified'}`)
      })
    }

    // Show recent celebrities
    if (celebrityCount > 0) {
      console.log('\n⭐ Recent Celebrities:')
      const celebrities = await prisma.celebrity.findMany({
        take: 5,
        orderBy: { id: 'desc' },
        select: {
          id: true,
          bio: true,
          category: true,
          rating: true,
          verified: true
        }
      })
      
      celebrities.forEach((celebrity, index) => {
        console.log(`   ${index + 1}. ${celebrity.bio?.substring(0, 50)}... - ${celebrity.category} - ⭐ ${celebrity.rating}`)
      })
    }

    // Show recent orders
    if (orderCount > 0) {
      console.log('\n📦 Recent Orders:')
      const orders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          createdAt: true
        }
      })
      
      orders.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.orderNumber} - ${order.status} - $${order.totalAmount}`)
      })
    }

  } catch (error) {
    console.error('❌ Error viewing data:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
viewProductionData()
