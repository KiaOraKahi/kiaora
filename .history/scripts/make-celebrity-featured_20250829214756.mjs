import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://e893fcb657947128bfda667435261cd0ce3bb99b2b03b135b1258741a3948bb7:sk_sn0rAw14woPhJErejkLgr@db.prisma.io:5432/postgres?sslmode=require"
    }
  }
});

async function makeCelebrityFeatured() {
  try {
    console.log('🔧 Making celebrity featured...\n');

    // Find the celebrity
    const celebrity = await prisma.celebrity.findFirst({
      include: {
        user: true
      }
    });

    if (!celebrity) {
      console.log('❌ No celebrity found to update');
      return;
    }

    console.log(`📊 Updating celebrity: ${celebrity.user.name}`);

    // Update the celebrity to be featured
    const updatedCelebrity = await prisma.celebrity.update({
      where: {
        id: celebrity.id
      },
      data: {
        featured: true,
        // Also add a profile image if it's missing
        user: {
          update: {
            image: celebrity.user.image || "/talents/2.jpg"
          }
        }
      },
      include: {
        user: true
      }
    });

    console.log('✅ Successfully updated celebrity:');
    console.log(`   Name: ${updatedCelebrity.user.name}`);
    console.log(`   Featured: ${updatedCelebrity.featured}`);
    console.log(`   Image: ${updatedCelebrity.user.image}`);
    console.log(`   Category: ${updatedCelebrity.category}`);
    console.log(`   Price: $${updatedCelebrity.price}`);
    
    console.log('\n🎉 The celebrity should now appear on the homepage!');

  } catch (error) {
    console.error('Error updating celebrity:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeCelebrityFeatured(); 