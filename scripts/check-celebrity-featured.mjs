import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://e893fcb657947128bfda667435261cd0ce3bb99b2b03b135b1258741a3948bb7:sk_sn0rAw14woPhJErejkLgr@db.prisma.io:5432/postgres?sslmode=require"
    }
  }
});

async function checkCelebrityFeatured() {
  try {
    console.log('🔍 Checking celebrity featured status...\n');

    const celebrity = await prisma.celebrity.findFirst({
      include: {
        user: true
      }
    });

    if (celebrity) {
      console.log('📊 Celebrity Details:');
      console.log(`   ID: ${celebrity.id}`);
      console.log(`   Name: ${celebrity.user.name}`);
      console.log(`   Featured: ${celebrity.featured}`);
      console.log(`   Verified: ${celebrity.verified}`);
      console.log(`   Active: ${celebrity.isActive}`);
      console.log(`   Category: ${celebrity.category}`);
      console.log(`   Price: $${celebrity.price}`);
      console.log(`   Image: ${celebrity.user.image}`);
      
      if (!celebrity.featured) {
        console.log('\n⚠️  Celebrity is not marked as featured! This is why it\'s not showing on the homepage.');
        console.log('   The homepage only shows celebrities with featured=true');
      } else {
        console.log('\n✅ Celebrity is featured and should appear on homepage');
      }
    } else {
      console.log('❌ No celebrities found in database');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCelebrityFeatured(); 