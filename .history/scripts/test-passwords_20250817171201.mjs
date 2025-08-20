import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const commonPasswords = [
  'postgres',
  'admin', 
  'password',
  '123456',
  '', // empty password
  'root',
  'user'
];

console.log('🔐 Testing Common PostgreSQL Passwords');
console.log('='.repeat(50));

async function testPassword(password) {
  const testUrl = `postgresql://postgres:${password}@localhost:5432/kia_ora_db`;
  
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: testUrl
        }
      }
    });
    
    await prisma.$connect();
    console.log(`✅ SUCCESS with password: "${password || '(empty)'}"`);
    await prisma.$disconnect();
    return password;
  } catch (error) {
    if (error.message.includes('Authentication failed')) {
      console.log(`❌ FAILED with password: "${password || '(empty)'}"`);
    } else if (error.message.includes('does not exist')) {
      console.log(`⚠️  Database 'kia_ora_db' does not exist - password "${password || '(empty)'}" works!`);
      return password;
    } else {
      console.log(`❌ ERROR with password "${password || '(empty)'}": ${error.message}`);
    }
    return null;
  }
}

async function testAllPasswords() {
  console.log('\n🧪 Testing passwords...\n');
  
  for (const password of commonPasswords) {
    const result = await testPassword(password);
    if (result !== null) {
      console.log(`\n🎉 WORKING PASSWORD FOUND: "${result || '(empty)'}"`);
      console.log('\n📝 Update your .env file with:');
      console.log(`DATABASE_URL="postgresql://postgres:${result}@localhost:5432/kia_ora_db"`);
      console.log('\n✅ Then run: node scripts/db-connection-test.mjs');
      return;
    }
  }
  
  console.log('\n❌ No common passwords worked.');
  console.log('\n💡 You may need to:');
  console.log('1. Check pgAdmin for the correct password');
  console.log('2. Reset the PostgreSQL password');
  console.log('3. Check if PostgreSQL is configured differently');
}

// Run the password tests
testAllPasswords();
