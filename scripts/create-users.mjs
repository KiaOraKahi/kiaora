import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Use production database URL directly
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://e893fcb657947128bfda667435261cd0ce3bb99b2b03b135b1258741a3948bb7:sk_sn0rAw14woPhJErejkLgr@db.prisma.io:5432/postgres?sslmode=require"
    }
  }
});

async function createUsers() {
  try {
    console.log('🔍 Checking existing users...');
    
    // Check existing users
    const existingUsers = await prisma.user.findMany({
      select: {
        email: true,
        role: true
      }
    });
    
    console.log('📋 Existing users:');
    existingUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });

    console.log('🚀 Creating new users...');
    
    const usersToCreate = [
      {
        name: "John Fan",
        email: "johnfan@example.com",
        password: "FanPassword123!",
        role: "FAN"
      },
      {
        name: "Sarah Celebrity",
        email: "sarahcelebrity@example.com",
        password: "CelebrityPass123!",
        role: "CELEBRITY"
      },
      {
        name: "Admin User",
        email: "admin@kiaora.com",
        password: "AdminPass123!",
        role: "ADMIN"
      }
    ];

    for (const userData of usersToCreate) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user
      const newUser = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          isVerified: true
        }
      });

      console.log(`✅ Created user: ${userData.email} (${userData.role})`);

      // If it's a celebrity, create celebrity profile
      if (userData.role === 'CELEBRITY') {
        try {
          const celebrityProfile = await prisma.celebrity.create({
            data: {
              userId: newUser.id,
              bio: 'Professional celebrity available for personalized video messages',
              category: 'Influencer',
              price: 299.0,
              isActive: true,
              verified: true,
              responseTime: '24 hours'
            }
          });
          console.log(`✅ Created celebrity profile for ${userData.email}`);
        } catch (error) {
          console.log(`⚠️  Could not create celebrity profile for ${userData.email}: ${error.message}`);
        }
      }
    }

    console.log('🎉 User creation completed!');
    
    // Show final user list
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        role: true
      }
    });
    
    console.log('\n📋 All users in database:');
    allUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });

  } catch (error) {
    console.error('❌ Error creating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUsers(); 