import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCelebrityCompleteData() {
  try {
    console.log('🔍 Checking complete celebrity data in database...\n')
    
    const celebrities = await prisma.celebrity.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            bookings: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(`📊 Found ${celebrities.length} celebrities in database:\n`)

    celebrities.forEach((celebrity, index) => {
      console.log(`${index + 1}. ${celebrity.user.name}`)
      console.log(`   Email: ${celebrity.user.email}`)
      console.log(`   Category: ${celebrity.category || '❌ Missing'}`)
      console.log(`   Price: $${celebrity.pricePersonal || '❌ Missing'}`)
      console.log(`   Active: ${celebrity.isActive ? '✅' : '❌'}`)
      console.log(`   Verified: ${celebrity.verified ? '✅' : '❌'}`)
      console.log(`   Featured: ${celebrity.featured ? '✅' : '❌'}`)
      console.log(`   Image: ${celebrity.user.image ? '✅' : '❌ Missing'}`)
      console.log(`   Bio: ${celebrity.bio ? '✅' : '❌ Missing'}`)
      console.log(`   Long Bio: ${celebrity.longBio ? '✅' : '❌ Missing'}`)
      console.log(`   Tags: ${celebrity.tags && celebrity.tags.length > 0 ? `✅ (${celebrity.tags.length})` : '❌ Missing'}`)
      console.log(`   Achievements: ${celebrity.achievements && celebrity.achievements.length > 0 ? `✅ (${celebrity.achievements.length})` : '❌ Missing'}`)
      console.log(`   Response Time: ${celebrity.responseTime || '❌ Missing'}`)
      console.log(`   Next Available: ${celebrity.nextAvailable || '❌ Missing'}`)
      console.log(`   Reviews: ${celebrity._count.reviews}`)
      console.log(`   Bookings: ${celebrity._count.bookings}`)
      
      // Calculate completeness score
      const fields = [
        celebrity.category,
        celebrity.pricePersonal,
        celebrity.bio,
        celebrity.longBio,
        celebrity.tags && celebrity.tags.length > 0,
        celebrity.achievements && celebrity.achievements.length > 0,
        celebrity.responseTime,
        celebrity.nextAvailable,
        celebrity.user.image
      ]
      
      const completedFields = fields.filter(field => field).length
      const completenessScore = Math.round((completedFields / fields.length) * 100)
      
      console.log(`   📊 Completeness: ${completenessScore}% (${completedFields}/${fields.length} fields)`)
      
      if (completenessScore < 70) {
        console.log(`   ⚠️  NEEDS ATTENTION: Low completeness score`)
      } else if (completenessScore < 90) {
        console.log(`   ⚡ GOOD: Most data complete`)
      } else {
        console.log(`   🎉 EXCELLENT: Complete profile`)
      }
      
      console.log('')
    })

    // Summary
    const completeProfiles = celebrities.filter(celebrity => {
      const fields = [
        celebrity.category,
        celebrity.pricePersonal,
        celebrity.bio,
        celebrity.longBio,
        celebrity.tags && celebrity.tags.length > 0,
        celebrity.achievements && celebrity.achievements.length > 0,
        celebrity.responseTime,
        celebrity.nextAvailable,
        celebrity.user.image
      ]
      const completedFields = fields.filter(field => field).length
      return (completedFields / fields.length) >= 0.9
    })

    const goodProfiles = celebrities.filter(celebrity => {
      const fields = [
        celebrity.category,
        celebrity.pricePersonal,
        celebrity.bio,
        celebrity.longBio,
        celebrity.tags && celebrity.tags.length > 0,
        celebrity.achievements && celebrity.achievements.length > 0,
        celebrity.responseTime,
        celebrity.nextAvailable,
        celebrity.user.image
      ]
      const completedFields = fields.filter(field => field).length
      return (completedFields / fields.length) >= 0.7 && (completedFields / fields.length) < 0.9
    })

    const incompleteProfiles = celebrities.filter(celebrity => {
      const fields = [
        celebrity.category,
        celebrity.pricePersonal,
        celebrity.bio,
        celebrity.longBio,
        celebrity.tags && celebrity.tags.length > 0,
        celebrity.achievements && celebrity.achievements.length > 0,
        celebrity.responseTime,
        celebrity.nextAvailable,
        celebrity.user.image
      ]
      const completedFields = fields.filter(field => field).length
      return (completedFields / fields.length) < 0.7
    })

    console.log('📈 SUMMARY:')
    console.log(`   🎉 Complete Profiles (90%+): ${completeProfiles.length}`)
    console.log(`   ⚡ Good Profiles (70-89%): ${goodProfiles.length}`)
    console.log(`   ⚠️  Incomplete Profiles (<70%): ${incompleteProfiles.length}`)
    console.log(`   📊 Total Celebrities: ${celebrities.length}`)

    if (incompleteProfiles.length > 0) {
      console.log('\n⚠️  CELEBRITIES NEEDING ATTENTION:')
      incompleteProfiles.forEach(celebrity => {
        console.log(`   - ${celebrity.user.name} (${celebrity.user.email})`)
      })
    }

  } catch (error) {
    console.error('❌ Error checking celebrity data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCelebrityCompleteData()
