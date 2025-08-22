import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
