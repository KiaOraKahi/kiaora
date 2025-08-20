import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('👑 Creating Admin User...');
    console.log('='.repeat(50));
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:');
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log('');
      console.log('💡 To create a new admin, first delete the existing one or use a different email.');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Create the admin user
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@kiaora.com',
        password: hashedPassword,
        role: 'ADMIN',
        isVerified: true,
        emailVerified: new Date(),
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      },
    });
    
    console.log('✅ Admin user created successfully!');
    console.log(`   User ID: ${admin.id}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: admin123`);
    console.log('');
    console.log('🌐 Access the admin panel at:');
    console.log('   http://localhost:3001/admin/login');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
