import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://e893fcb657947128bfda667435261cd0ce3bb99b2b03b135b1258741a3948bb7:sk_sn0rAw14woPhJErejkLgr@db.prisma.io:5432/postgres?sslmode=require"
    }
  }
});

async function checkAllCelebrities() {
  try {
    console.log('🔍 Checking all celebrities in database...\n');

    // Get all celebrities with user data
    const celebrities = await prisma.celebrity.findMany({
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Found ${celebrities.length} celebrities in database:\n`);

    celebrities.forEach((celebrity, index) => {
      console.log(`${index + 1}. Celebrity ID: ${celebrity.id}`);
      console.log(`   User ID: ${celebrity.userId}`);
      console.log(`   Name: ${celebrity.user.name}`);
      console.log(`   Email: ${celebrity.user.email}`);
      console.log(`   Category: ${celebrity.category}`);
      console.log(`   Price: $${celebrity.price}`);
      console.log(`   Active: ${celebrity.isActive}`);
      console.log(`   Verified: ${celebrity.verified}`);
      console.log(`   Featured: ${celebrity.featured}`);
      console.log(`   Image: ${celebrity.user.image}`);
      console.log(`   Rating: ${celebrity.averageRating}`);
      console.log(`   Reviews: ${celebrity.totalReviews}`);
      console.log('');
    });

    // Also check all users with CELEBRITY role
    const celebrityUsers = await prisma.user.findMany({
      where: {
        role: "CELEBRITY"
      },
      include: {
        celebrityProfile: true
      }
    });

    console.log(`👥 Users with CELEBRITY role (${celebrityUsers.length}):`);
    celebrityUsers.forEach((user, index) => {
      console.log(`${index + 1}. User ID: ${user.id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Has Profile: ${user.celebrityProfile ? 'Yes' : 'No'}`);
      console.log(`   Image: ${user.image}`);
      console.log('');
    });

    // Check which celebrities are active and featured
    const activeCelebrities = celebrities.filter(c => c.isActive);
    const featuredCelebrities = celebrities.filter(c => c.featured);
    const verifiedCelebrities = celebrities.filter(c => c.verified);

    console.log('📈 Summary:');
    console.log(`   Total Celebrities: ${celebrities.length}`);
    console.log(`   Active: ${activeCelebrities.length}`);
    console.log(`   Featured: ${featuredCelebrities.length}`);
    console.log(`   Verified: ${verifiedCelebrities.length}`);
    console.log('');

    if (activeCelebrities.length > 0) {
      console.log('✅ Celebrities should appear on both homepage and celebrities page!');
    } else {
      console.log('⚠️  No active celebrities found!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllCelebrities(); 