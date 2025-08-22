#!/usr/bin/env node
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XNjN0WUZkZ2tPb0ljeTFveVhRaVMiLCJhcGlfa2V5IjoiMDFLMzhaOFc2VEJKQVRBWVM1M0VTNFFUMjciLCJ0ZW5hbnRfaWQiOiI5N2UxMGE4MDRiMzcxNDEzYjJhZGZhZjdhYzViMzFkMjhmY2FjYjAzZWZkNWMyOTNhYWZiYmY4NzBhYmNlN2FhIiwiaW50ZXJuYWxfc2VjcmV0IjoiZjI3ZTQyNmItZjY2NS00ZDI1LWE4OGEtM2E1NTgwMmIyODVmIn0.F7jaLciHEiq3GPE1CANg51wLP6FdxMQCYiCTHSQwdcY"
    }
  }
})

async function createServices() {
  console.log('🔧 Creating services...\n')
  
  try {
    // Find the celebrity
    const celebrity = await prisma.celebrity.findFirst({
      where: {
        user: {
          email: 'sarahcelebrity@example.com'
        }
      }
    })

    if (!celebrity) {
      console.log('❌ Celebrity not found!')
      return
    }

    console.log(`📝 Found celebrity: ${celebrity.id}`)

    // Create services
    const services = [
      {
        title: "Personal Video Message",
        description: "A personalized video message for birthdays, anniversaries, or special occasions",
        basePrice: 299,
        duration: "30 sec - 1min",
        deliveryTime: "1 - 3 days",
        features: ["Personalized message", "High quality video", "Quick delivery"],
        icon: "🎬"
      },
      {
        title: "Business Promotion",
        description: "Professional video promotion for your business or product",
        basePrice: 599,
        duration: "45 sec - 2min",
        deliveryTime: "2 - 5 days",
        features: ["Professional quality", "Business focused", "Extended duration"],
        icon: "💼"
      },
      {
        title: "Charity Support",
        description: "Support your favorite charity with a special video message",
        basePrice: 199,
        duration: "30 sec - 1min",
        deliveryTime: "1 - 3 days",
        features: ["Charity focused", "Affordable pricing", "Quick delivery"],
        icon: "❤️"
      }
    ]

    for (const serviceData of services) {
      const service = await prisma.service.create({
        data: {
          title: serviceData.title,
          description: serviceData.description,
          basePrice: serviceData.basePrice,
          duration: serviceData.duration,
          deliveryTime: serviceData.deliveryTime,
          features: serviceData.features,
          icon: serviceData.icon,
          celebrityId: celebrity.id
        }
      })

      console.log(`✅ Created service: ${service.title} (ID: ${service.id})`)
    }

    console.log('\n🎉 All services created successfully!')

  } catch (error) {
    console.error('❌ Error creating services:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createServices()
