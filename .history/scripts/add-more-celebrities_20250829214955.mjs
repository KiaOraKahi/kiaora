import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://e893fcb657947128bfda667435261cd0ce3bb99b2b03b135b1258741a3948bb7:sk_sn0rAw14woPhJErejkLgr@db.prisma.io:5432/postgres?sslmode=require"
    }
  }
});

async function addMoreCelebrities() {
  try {
    console.log('🌟 Adding more featured celebrities...\n');

    const celebrities = [
      {
        name: "Emma Stone",
        email: "emma.stone@example.com",
        category: "Actor",
        price: 299,
        bio: "Academy Award-winning actress known for her versatile performances in comedy and drama.",
        image: "/talents/1.jpeg",
        tags: ["Hollywood", "Award Winner", "Comedy", "Drama"]
      },
      {
        name: "Tony Robbins",
        email: "tony.robbins@example.com", 
        category: "Motivator",
        price: 899,
        bio: "World-renowned life coach and motivational speaker helping people achieve their dreams.",
        image: "/talents/3.jpg",
        tags: ["Motivation", "Life Coach", "Business", "Success"]
      },
      {
        name: "MrBeast",
        email: "mrbeast@example.com",
        category: "Influencer", 
        price: 1299,
        bio: "YouTube sensation and philanthropist known for his incredible generosity and entertaining content.",
        image: "/talents/4.jpg",
        tags: ["YouTube", "Philanthropy", "Entertainment", "Viral"]
      },
      {
        name: "Oprah Winfrey",
        email: "oprah@example.com",
        category: "Motivator",
        price: 1999,
        bio: "Media mogul, philanthropist, and inspirational leader who has touched millions of lives worldwide.",
        image: "/talents/5.jpg", 
        tags: ["Media", "Philanthropy", "Inspiration", "Leadership"]
      },
      {
        name: "Ryan Reynolds",
        email: "ryan.reynolds@example.com",
        category: "Actor",
        price: 799,
        bio: "Beloved actor known for his wit, charm, and memorable performances in action and comedy films.",
        image: "/talents/6.jpg",
        tags: ["Hollywood", "Comedy", "Action", "Charm"]
      }
    ];

    for (const celebData of celebrities) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: celebData.email }
        });

        if (existingUser) {
          console.log(`⚠️  User ${celebData.name} already exists, skipping...`);
          continue;
        }

        // Create user
        const hashedPassword = await bcrypt.hash("CelebrityPass123!", 12);
        
        const user = await prisma.user.create({
          data: {
            name: celebData.name,
            email: celebData.email,
            password: hashedPassword,
            role: "CELEBRITY",
            image: celebData.image,
            emailVerified: new Date()
          }
        });

        // Create celebrity profile
        const celebrity = await prisma.celebrity.create({
          data: {
            userId: user.id,
            category: celebData.category,
            bio: celebData.bio,
            price: celebData.price,
            averageRating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
            totalReviews: Math.floor(Math.random() * 50) + 10, // Random reviews 10-60
            responseTime: "24 hours",
            completionRate: 95 + Math.floor(Math.random() * 5), // 95-100%
            verified: true,
            featured: true,
            isActive: true,
            nextAvailable: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Random date within next week
            tags: celebData.tags
          }
        });

        console.log(`✅ Created celebrity: ${celebData.name} (${celebData.category})`);
        console.log(`   Price: $${celebData.price}`);
        console.log(`   Image: ${celebData.image}`);
        console.log(`   Featured: true`);
        console.log('');

      } catch (error) {
        console.error(`❌ Error creating ${celebData.name}:`, error.message);
      }
    }

    console.log('🎉 Finished adding celebrities!');
    console.log('📊 All new celebrities are featured and should appear on the homepage.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMoreCelebrities(); 