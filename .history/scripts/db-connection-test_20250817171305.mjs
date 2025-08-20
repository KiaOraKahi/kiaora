import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

console.log('🔍 Database Connection Test');
console.log('='.repeat(50));

// Check environment variables
console.log('\n📋 Environment Variables Check:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');

if (process.env.DATABASE_URL) {
  console.log('Database URL preview:', process.env.DATABASE_URL.substring(0, 50) + '...');
}

// Check if we can create a Prisma client
try {
  console.log('\n🔧 Creating Prisma client...');
  const prisma = new PrismaClient();
  console.log('✅ Prisma client created successfully');
  
  // Try to connect
  console.log('\n🔌 Attempting to connect to database...');
  await prisma.$connect();
  console.log('✅ Database connection successful!');
  
  // Test a simple query
  console.log('\n📊 Testing database query...');
  const userCount = await prisma.user.count();
  console.log(`✅ Database query successful! Found ${userCount} users`);
  
  await prisma.$disconnect();
  console.log('🔌 Database disconnected');
  
} catch (error) {
  console.log('\n❌ Database connection failed:');
  console.log('Error:', error.message);
  
  if (error.message.includes('DATABASE_URL')) {
    console.log('\n💡 To fix this issue:');
    console.log('1. Make sure your .env file is in the project root');
    console.log('2. Check the DATABASE_URL format');
    console.log('3. Verify the database exists and is accessible');
    console.log('\n📝 Example .env file content:');
    console.log('DATABASE_URL="postgresql://postgres:password@localhost:5432/kia_ora_db"');
    console.log('NODE_ENV="development"');
  }
  
  if (error.message.includes('connection')) {
    console.log('\n💡 Database connection issues:');
    console.log('1. Check if your PostgreSQL database is running');
    console.log('2. Verify the connection string is correct');
    console.log('3. Check firewall and network settings');
    console.log('4. Ensure the database exists and is accessible');
  }
  
  if (error.message.includes('does not exist')) {
    console.log('\n💡 Database does not exist:');
    console.log('1. Create the database: CREATE DATABASE kia_ora_db;');
    console.log('2. Or run: npx prisma db push');
  }
}

console.log('\n🔍 Database Schema Information:');
console.log('Based on your Prisma schema, you have these models:');
console.log('- User (with roles: FAN, CELEBRITY, ADMIN)');
console.log('- Celebrity (celebrity profiles)');
console.log('- Booking (video requests)');
console.log('- Order (transactions)');
console.log('- Tip (gratuity payments)');
console.log('- Review (customer feedback)');
console.log('- Account (OAuth connections)');
console.log('- Session (user sessions)');

console.log('\n💡 To query users, you need:');
console.log('1. A working database connection');
console.log('2. The DATABASE_URL environment variable set');
console.log('3. Your database to be running and accessible');
console.log('\nOnce connected, you can run:');
console.log('node scripts/query-users.mjs');
console.log('node scripts/find-specific-users.mjs');
