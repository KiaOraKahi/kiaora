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
        shortDescription: "Personalized video messages for special occasions",
        fullDescription: "A personalized video message for birthdays, anniversaries, or special occasions. Perfect for making someone's day extra special!",
        startingPrice: 299,
        asapPrice: 399,
        duration: "30 sec - 1min",
        deliveryTime: "1 - 3 days",
        asapDeliveryTime: "24 hours",
        icon: "🎬",
        color: "#8B5CF6"
      },
      {
        title: "Business Promotion",
        shortDescription: "Professional video promotion for your business",
        fullDescription: "Professional video promotion for your business or product. High-quality content that helps grow your brand!",
        startingPrice: 599,
        asapPrice: 799,
        duration: "45 sec - 2min",
        deliveryTime: "2 - 5 days",
        asapDeliveryTime: "48 hours",
        icon: "💼",
        color: "#10B981"
      },
      {
        title: "Charity Support",
        shortDescription: "Support your favorite charity with a special message",
        fullDescription: "Support your favorite charity with a special video message. Help raise awareness and funds for important causes!",
        startingPrice: 199,
        asapPrice: 299,
        duration: "30 sec - 1min",
        deliveryTime: "1 - 3 days",
        asapDeliveryTime: "24 hours",
        icon: "❤️",
        color: "#EF4444"
      }
    ]

    for (const serviceData of services) {
      const service = await prisma.service.create({
        data: {
          title: serviceData.title,
          shortDescription: serviceData.shortDescription,
          fullDescription: serviceData.fullDescription,
          startingPrice: serviceData.startingPrice,
          asapPrice: serviceData.asapPrice,
          duration: serviceData.duration,
          deliveryTime: serviceData.deliveryTime,
          asapDeliveryTime: serviceData.asapDeliveryTime,
          icon: serviceData.icon,
          color: serviceData.color,
          popular: false,
          isActive: true,
          order: 0,
          currency: "nzd",
          samples: [],
          talents: []
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
