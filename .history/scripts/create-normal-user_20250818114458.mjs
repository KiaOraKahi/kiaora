import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function createNormalUser() {
  try {
    console.log('👤 Creating Normal User (FAN)...');
    console.log('='.repeat(50));
    
    // Hash password
    const hashedPassword = await bcrypt.hash('user123', 12);
    
    // Create the user
    const user = await prisma.user.create({
      data: {
        name: 'John Smith',
        email: 'john.smith@example.com',
        password: hashedPassword,
        role: 'FAN',
        isVerified: true,
        emailVerified: new Date(),
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      },
    });
    
    console.log('✅ User created successfully!');
    console.log(`   User ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Verified: ${user.isVerified ? 'Yes' : 'No'}`);
    console.log(`   Created: ${user.createdAt}`);
    
    // Fetch the complete user
    const completeUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    
    console.log('\n🎉 NORMAL USER CREATED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log(`Name: ${completeUser.name}`);
    console.log(`Email: ${completeUser.email}`);
    console.log(`Password: user123 (for testing)`);
    console.log(`Role: ${completeUser.role}`);
    console.log(`Verified: ${completeUser.isVerified ? 'Yes' : 'No'}`);
    console.log(`Email Verified: ${completeUser.emailVerified ? 'Yes' : 'No'}`);
    
    console.log('\n💡 Login Credentials:');
    console.log('Email: john.smith@example.com');
    console.log('Password: user123');
    
    console.log('\n🔗 Next Steps:');
    console.log('1. Start the application: npm run dev');
    console.log('2. Login with the credentials above');
    console.log('3. Browse celebrities and make booking requests');
    console.log('4. View your orders and manage your account');
    
  } catch (error) {
    console.error('❌ Error creating normal user:', error);
    
    if (error.code === 'P2002') {
      console.log('\n💡 User already exists with this email.');
      console.log('Try a different email address.');
    }
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database disconnected');
  }
}

// Run the normal user creation
createNormalUser();
