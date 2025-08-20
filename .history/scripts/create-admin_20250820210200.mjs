import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('👑 Creating/Updating Admin User...');
    console.log('='.repeat(50));
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });
    
    if (existingAdmin) {
      console.log('📝 Admin already exists, updating verification status...');
      
      // Update the existing admin to ensure it's verified
      const updatedAdmin = await prisma.user.update({
        where: { email: 'admin@example.com' },
        data: {
          isVerified: true,
          emailVerified: new Date(),
          role: 'ADMIN'
        }
      });
      
      console.log('✅ Admin updated successfully!');
      console.log(`   User ID: ${updatedAdmin.id}`);
      console.log(`   Name: ${updatedAdmin.name}`);
      console.log(`   Email: ${updatedAdmin.email}`);
      console.log(`   Role: ${updatedAdmin.role}`);
      console.log(`   Verified: ${updatedAdmin.isVerified ? 'Yes' : 'No'}`);
      console.log(`   Email Verified: ${updatedAdmin.emailVerified ? 'Yes' : 'No'}`);
      
    } else {
      console.log('🆕 Creating new admin user...');
      
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
      console.log(`   Email Verified: ${admin.emailVerified ? 'Yes' : 'No'}`);
    }
    
    console.log('\n🎉 ADMIN USER READY!');
    console.log('='.repeat(50));
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('Role: ADMIN');
    console.log('Status: VERIFIED');
    
    console.log('\n💡 Login Credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
    console.log('\n🔗 Next Steps:');
    console.log('1. Start the application: npm run dev');
    console.log('2. Go to /admin/login');
    console.log('3. Login with the credentials above');
    console.log('4. Access the admin dashboard');
    
  } catch (error) {
    console.error('❌ Error creating/updating admin:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database disconnected');
  }
}

createAdmin();
