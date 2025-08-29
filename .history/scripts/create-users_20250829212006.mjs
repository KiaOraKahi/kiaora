import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUsers() {
  try {
    console.log('🔍 Checking existing users...');
    
    // Check existing users
    const existingUsers = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
        name: true
      }
    });
    
    console.log('📋 Existing users:');
    existingUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });
    
    // Define the users to create
    const usersToCreate = [
      {
        email: 'johnfan@example.com',
        password: 'FanPassword123!',
        name: 'John Fan',
        role: 'FAN'
      },
      {
        email: 'sarahcelebrity@example.com',
        password: 'CelebrityPass123!',
        name: 'Sarah Celebrity',
        role: 'CELEBRITY'
      },
      {
        email: 'admin@kiaora.com',
        password: 'AdminPass123!',
        name: 'Admin User',
        role: 'ADMIN'
      }
    ];
    
    console.log('\n🚀 Creating new users...');
    
    for (const userData of usersToCreate) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      
      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists (${existingUser.role})`);
        continue;
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const newUser = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
          isVerified: true,
          emailVerified: new Date()
        }
      });
      
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
      
      // If it's a celebrity, create celebrity profile
      if (userData.role === 'CELEBRITY') {
        const celebrityProfile = await prisma.celebrity.create({
          data: {
            userId: newUser.id,
            bio: 'Professional celebrity available for personalized video messages',
            category: 'Influencer',
            price: 299.0,
            isActive: true,
            verified: true,
            responseTime: '24 hours',
            availability: '24 hours'
          }
        });
        console.log(`✅ Created celebrity profile for ${userData.email}`);
      }
    }
    
    console.log('\n🎉 User creation completed!');
    
    // Show final user list
    const finalUsers = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
        name: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });
    
    console.log('\n📊 Final user list:');
    finalUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - Created: ${user.createdAt.toISOString()}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUsers(); 