import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixBritneySpearsImage() {
  try {
    console.log('🔧 Fixing Britney Spears image...')
    
    // Find Britney Spears by email (more reliable)
    const britney = await prisma.celebrity.findFirst({
      where: {
        user: {
          email: 'brity@gmail.com'
        }
      },
      include: {
        user: true
      }
    })

    if (!britney) {
      console.log('❌ Britney Spears not found in database')
      return
    }

    console.log(`📸 Current image: ${britney.user.image}`)
    
    // Update to use a proper local image path
    const updatedUser = await prisma.user.update({
      where: { id: britney.userId },
      data: { 
        image: '/talents/7.jpg' // Using a new talent image
      }
    })

    console.log(`✅ Updated Britney Spears image to: ${updatedUser.image}`)
    
    // Also update the celebrity's cover image
    const updatedCelebrity = await prisma.celebrity.update({
      where: { id: britney.id },
      data: { 
        coverImage: '/talents/7.jpg'
      }
    })

    console.log(`✅ Updated celebrity cover image to: ${updatedCelebrity.coverImage}`)
    
  } catch (error) {
    console.error('❌ Error fixing Britney Spears image:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixBritneySpearsImage()
