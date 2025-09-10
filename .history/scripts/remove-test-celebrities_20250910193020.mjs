import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function removeTestCelebrities() {
  try {
    console.log('🗑️ Removing test celebrities from database...\n')
    
    // Find the celebrities to remove
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

    const britneyCeleb = await prisma.celebrity.findFirst({
      where: {
        user: {
          email: 'brity@gmail.com'
        }
      },
      include: {
        user: true
      }
    })

    if (testCeleb) {
      console.log(`📋 Found testecleb: ${testCeleb.user.name} (${testCeleb.user.email})`)
      console.log(`   Celebrity ID: ${testCeleb.id}`)
      console.log(`   User ID: ${testCeleb.userId}`)
    } else {
      console.log('❌ testecleb not found')
    }

    if (britneyCeleb) {
      console.log(`📋 Found Britney Speares: ${britneyCeleb.user.name} (${britneyCeleb.user.email})`)
      console.log(`   Celebrity ID: ${britneyCeleb.id}`)
      console.log(`   User ID: ${britneyCeleb.userId}`)
    } else {
      console.log('❌ Britney Speares not found')
    }

    console.log('\n🗑️ Deleting celebrities and their associated data...')

    // Delete testecleb
    if (testCeleb) {
      // Delete associated data first
      await prisma.review.deleteMany({
        where: { celebrityId: testCeleb.id }
      })
      
      await prisma.booking.deleteMany({
        where: { celebrityId: testCeleb.id }
      })

      // Delete the celebrity record
      await prisma.celebrity.delete({
        where: { id: testCeleb.id }
      })

      // Delete the user record
      await prisma.user.delete({
        where: { id: testCeleb.userId }
      })

      console.log('✅ testecleb deleted successfully')
    }

    // Delete Britney Speares
    if (britneyCeleb) {
      // Delete associated data first
      await prisma.review.deleteMany({
        where: { celebrityId: britneyCeleb.id }
      })
      
      await prisma.booking.deleteMany({
        where: { celebrityId: britneyCeleb.id }
      })

      // Delete the celebrity record
      await prisma.celebrity.delete({
        where: { id: britneyCeleb.id }
      })

      // Delete the user record
      await prisma.user.delete({
        where: { id: britneyCeleb.userId }
      })

      console.log('✅ Britney Speares deleted successfully')
    }

    console.log('\n🎉 Test celebrities removal completed!')
    
    // Show remaining celebrities
    const remainingCelebrities = await prisma.celebrity.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    })

    console.log(`\n📊 Remaining celebrities: ${remainingCelebrities.length}`)
    remainingCelebrities.forEach((celebrity, index) => {
      console.log(`${index + 1}. ${celebrity.user.name} (${celebrity.user.email})`)
    })
    
  } catch (error) {
    console.error('❌ Error removing test celebrities:', error)
  } finally {
    await prisma.$disconnect()
  }
}

removeTestCelebrities()
