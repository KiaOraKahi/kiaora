import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('👑 Creating Admin User...');
    console.log('='.repeat(50));
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Create the admin user
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN',
        isVerified: true,
        emailVerified: new Date(),
      },
    });
    
    console.log('✅ Admin created successfully!');
    console.log(`   User ID: ${admin.id}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Verified: ${admin.isVerified ? 'Yes' : 'No'}`);
    console.log(`   Created: ${admin.createdAt}`);
    
    console.log('\n🎉 ADMIN USER CREATED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('Role: ADMIN');
    
    console.log('\n💡 Login Credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
    console.log('\n🔗 Next Steps:');
    console.log('1. Start the application: npm run dev');
    console.log('2. Go to /admin/login');
    console.log('3. Login with the credentials above');
    console.log('4. Access the admin dashboard');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    
    if (error.code === 'P2002') {
      console.log('\n💡 Admin already exists with this email.');
      console.log('You can use the existing admin account:');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
    }
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database disconnected');
  }
}

createAdmin();
