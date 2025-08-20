import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

// Get command line arguments
const args = process.argv.slice(2);

// Default values
let name = 'Test User';
let email = 'test.user@example.com';
let password = 'password123';
let role = 'FAN';

// Parse command line arguments
for (let i = 0; i < args.length; i += 2) {
  const flag = args[i];
  const value = args[i + 1];
  
  switch (flag) {
    case '--name':
    case '-n':
      name = value;
      break;
    case '--email':
    case '-e':
      email = value;
      break;
    case '--password':
    case '-p':
      password = value;
      break;
    case '--role':
    case '-r':
      role = value.toUpperCase();
      break;
    case '--help':
    case '-h':
      console.log(`
Usage: node scripts/create-custom-user.mjs [options]

Options:
  -n, --name <name>       User's full name (default: "Test User")
  -e, --email <email>     User's email address (default: "test.user@example.com")
  -p, --password <pass>   User's password (default: "password123")
  -r, --role <role>       User's role: FAN, CELEBRITY, or ADMIN (default: "FAN")
  -h, --help             Show this help message

Examples:
  node scripts/create-custom-user.mjs
  node scripts/create-custom-user.mjs --name "John Doe" --email "john@example.com"
  node scripts/create-custom-user.mjs -n "Jane Smith" -e "jane@example.com" -p "mypassword" -r "FAN"
`);
      process.exit(0);
  }
}

// Validate role
const validRoles = ['FAN', 'CELEBRITY', 'ADMIN'];
if (!validRoles.includes(role)) {
  console.error(`❌ Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`);
  process.exit(1);
}

async function createCustomUser() {
  try {
    console.log('👤 Creating Custom User...');
    console.log('='.repeat(50));
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Role: ${role}`);
    console.log('='.repeat(50));
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
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
    
    // If it's a celebrity, create celebrity profile
    if (role === 'CELEBRITY') {
      const celebrityProfile = await prisma.celebrity.create({
        data: {
          userId: user.id,
          bio: `Professional ${name} available for personalized video messages.`,
          longBio: `${name} is a talented professional available for personalized video messages and content creation.`,
          category: 'Entertainment',
          price: 199.99,
          rating: 4.5,
          averageRating: 4.5,
          totalReviews: 0,
          completionRate: 95,
          responseTime: '24 hours',
          isActive: true,
          verified: true,
          featured: false,
          nextAvailable: '2024-01-15',
          tags: ['Professional', 'Reliable', 'Friendly'],
          achievements: ['Verified Creator'],
          totalEarnings: 0,
          totalTips: 0,
          pendingEarnings: 0,
          preferredCurrency: 'nzd',
          payoutSchedule: 'WEEKLY',
        },
      });
      
      console.log('✅ Celebrity profile created successfully!');
      console.log(`   Celebrity ID: ${celebrityProfile.id}`);
      console.log(`   Category: ${celebrityProfile.category}`);
      console.log(`   Price: $${celebrityProfile.price}`);
    }
    
    // Fetch the complete user
    const completeUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        celebrityProfile: role === 'CELEBRITY' ? true : false,
      },
    });
    
    console.log('\n🎉 USER CREATED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log(`Name: ${completeUser.name}`);
    console.log(`Email: ${completeUser.email}`);
    console.log(`Password: ${password} (for testing)`);
    console.log(`Role: ${completeUser.role}`);
    console.log(`Verified: ${completeUser.isVerified ? 'Yes' : 'No'}`);
    console.log(`Email Verified: ${completeUser.emailVerified ? 'Yes' : 'No'}`);
    
    if (role === 'CELEBRITY' && completeUser.celebrityProfile) {
      console.log(`Category: ${completeUser.celebrityProfile.category}`);
      console.log(`Price: $${completeUser.celebrityProfile.price}`);
      console.log(`Rating: ${completeUser.celebrityProfile.rating}`);
    }
    
    console.log('\n💡 Login Credentials:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
    console.log('\n🔗 Next Steps:');
    console.log('1. Start the application: npm run dev');
    console.log('2. Login with the credentials above');
    if (role === 'FAN') {
      console.log('3. Browse celebrities and make booking requests');
      console.log('4. View your orders and manage your account');
    } else if (role === 'CELEBRITY') {
      console.log('3. Access the celebrity dashboard');
      console.log('4. View and manage booking requests');
    } else if (role === 'ADMIN') {
      console.log('3. Access the admin panel');
      console.log('4. Manage users, bookings, and platform settings');
    }
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
    
    if (error.code === 'P2002') {
      console.log('\n💡 User already exists with this email.');
      console.log('Try a different email address.');
    }
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database disconnected');
  }
}

// Run the custom user creation
createCustomUser();
