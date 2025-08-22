import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PRISMA_DATABASE_URL || "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XNjN0WUZkZ2tPb0ljeTFveVhRaVMiLCJhcGlfa2V5IjoiMDFLMzhaOFc2VEJKQVRBWVM1M0VTNFFUMjciLCJ0ZW5hbnRfaWQiOiI5N2UxMGE4MDRiMzcxNDEzYjJhZGZhZjdhYzViMzFkMjhmY2FjYjAzZWZkNWMyOTNhYWZiYmY4NzBhYmNlN2FhIiwiaW50ZXJuYWxfc2VjcmV0IjoiZjI3ZTQyNmItZjY2NS00ZDI1LWE4OGEtM2E1NTgwMmIyODVmIn0.F7jaLciHEiq3GPE1CANg51wLP6FdxMQCYiCTHSQwdcY"
    }
  }
})

async function updateCelebrityName() {
  try {
    console.log('🔧 Updating celebrity name...')

    // Find the celebrity user
    const celebrityUser = await prisma.user.findFirst({
      where: {
        email: 'sarahcelebrity@example.com',
        role: 'CELEBRITY'
      }
    })

    if (!celebrityUser) {
      console.log('❌ Celebrity user not found')
      return
    }

    console.log(`📝 Found celebrity user: ${celebrityUser.name} (ID: ${celebrityUser.id})`)

    // Update the user name to just "Sarah"
    const updatedUser = await prisma.user.update({
      where: {
        id: celebrityUser.id
      },
      data: {
        name: 'Sarah'
      }
    })

    console.log('✅ Celebrity name updated successfully!')
    console.log(`   - Old name: ${celebrityUser.name}`)
    console.log(`   - New name: ${updatedUser.name}`)

  } catch (error) {
    console.error('❌ Error updating celebrity name:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateCelebrityName()
