import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixBrokenCelebrityImages() {
  try {
    console.log('🔧 Fixing broken celebrity images...')
    
    // Fix Britney Speares
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

    if (britney) {
      console.log(`📸 Britney Speares current image: ${britney.user.image}`)
      
      const updatedBritneyUser = await prisma.user.update({
        where: { id: britney.userId },
        data: { 
          image: '/talents/7.jpg'
        }
      })

      await prisma.celebrity.update({
        where: { id: britney.id },
        data: { 
          coverImage: '/talents/7.jpg'
        }
      })

      console.log(`✅ Updated Britney Speares image to: ${updatedBritneyUser.image}`)
    }

    // Fix testecleb
    const testCeleb = await prisma.celebrity.findFirst({
      where: {
        user: {
          email: 'testcelb@example.com'
        }
      },
      include: {
        user: true
      }
    })

    if (testCeleb) {
      console.log(`📸 testecleb current image: ${testCeleb.user.image}`)
      
      const updatedTestCelebUser = await prisma.user.update({
        where: { id: testCeleb.userId },
        data: { 
          image: '/talents/8.jpg'
        }
      })

      await prisma.celebrity.update({
        where: { id: testCeleb.id },
        data: { 
          coverImage: '/talents/8.jpg'
        }
      })

      console.log(`✅ Updated testecleb image to: ${updatedTestCelebUser.image}`)
    }
    
    console.log('🎉 All broken celebrity images fixed!')
    
  } catch (error) {
    console.error('❌ Error fixing celebrity images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixBritneySpearsImage()
