import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createCelebrityProfile() {
  try {
    console.log('🔍 Finding Sarah Celebrity user...');
    
    // Find Sarah's user account
    const sarahUser = await prisma.user.findUnique({
      where: { email: 'sarahcelebrity@example.com' }
    });
    
    if (!sarahUser) {
      console.log('❌ Sarah Celebrity user not found');
      return;
    }
    
    console.log(`✅ Found Sarah: ${sarahUser.name} (${sarahUser.role})`);
    
    // Check if celebrity profile already exists
    const existingProfile = await prisma.celebrity.findUnique({
      where: { userId: sarahUser.id }
    });
    
    if (existingProfile) {
      console.log('⚠️  Celebrity profile already exists for Sarah');
      return;
    }
    
    // Create celebrity profile
    const celebrityProfile = await prisma.celebrity.create({
      data: {
        userId: sarahUser.id,
        bio: 'Professional celebrity available for personalized video messages',
        category: 'Influencer',
        price: 299.0,
        isActive: true,
        verified: true,
        responseTime: '24 hours'
      }
    });
    
    console.log('✅ Created celebrity profile for Sarah Celebrity');
    console.log(`   Profile ID: ${celebrityProfile.id}`);
    console.log(`   Category: ${celebrityProfile.category}`);
    console.log(`   Price: $${celebrityProfile.price}`);
    
  } catch (error) {
    console.error('❌ Error creating celebrity profile:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCelebrityProfile(); 