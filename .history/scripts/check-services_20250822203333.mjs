#!/usr/bin/env node
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XNjN0WUZkZ2tPb0ljeTFveVhRaVMiLCJhcGlfa2V5IjoiMDFLMzhaOFc2VEJKQVRBWVM1M0VTNFFUMjciLCJ0ZW5hbnRfaWQiOiI5N2UxMGE4MDRiMzcxNDEzYjJhZGZhZjdhYzViMzFkMjhmY2FjYjAzZWZkNWMyOTNhYWZiYmY4NzBhYmNlN2FhIiwiaW50ZXJuYWxfc2VjcmV0IjoiZjI3ZTQyNmItZjY2NS00ZDI1LWE4OGEtM2E1NTgwMmIyODVmIn0.F7jaLciHEiq3GPE1CANg51wLP6FdxMQCYiCTHSQwdcY"
    }
  }
})

async function checkServices() {
  console.log('🔍 Checking services in database...\n')
  
  try {
    const services = await prisma.service.findMany()

    console.log(`📊 Found ${services.length} services in database:\n`)

    if (services.length === 0) {
      console.log('❌ No services found in database!')
      console.log('💡 You need to create services first.')
      return
    }

    services.forEach((service, index) => {
      console.log(`${index + 1}. Service ID: ${service.id}`)
      console.log(`   Title: ${service.title}`)
      console.log(`   Description: ${service.description}`)
      console.log(`   Base Price: $${service.basePrice}`)
      console.log(`   Duration: ${service.duration}`)
      console.log(`   Delivery Time: ${service.deliveryTime}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error checking services:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkServices()
