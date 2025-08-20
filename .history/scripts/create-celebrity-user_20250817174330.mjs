import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function createCelebrityUser() {
  try {
    console.log('🎭 Creating Celebrity User...');
    console.log('='.repeat(50));
    
    // Hash password
    const hashedPassword = await bcrypt.hash('celebrity123', 12);
    
    // Create the user
    const user = await prisma.user.create({
      data: {
        name: 'Emma Stone',
        email: 'emma.stone@example.com',
        password: hashedPassword,
        role: 'CELEBRITY',
        isVerified: true,
        emailVerified: new Date(),
        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      },
    });
    
    console.log('✅ User created successfully!');
    console.log(`   User ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    
    // Create celebrity profile
    const celebrityProfile = await prisma.celebrity.create({
      data: {
        userId: user.id,
        bio: 'Academy Award-winning actress known for her versatile performances in both dramatic and comedic roles.',
        longBio: 'Emma Stone is an American actress and producer. She is the recipient of various accolades, including an Academy Award, a British Academy Film Award, and a Golden Globe Award. She has been one of the world\'s highest-paid actresses since 2017.',
        category: 'Actor',
        price: 299.99,
        rating: 4.9,
        averageRating: 4.9,
        totalReviews: 0,
        completionRate: 98,
        responseTime: '24 hours',
        isActive: true,
        verified: true,
        featured: true,
        nextAvailable: '2024-01-15',
        tags: ['Academy Award Winner', 'Versatile', 'Professional'],
        achievements: ['Academy Award Winner', 'Golden Globe Winner', 'BAFTA Winner'],
        totalEarnings: 0,
        totalTips: 0,
        pendingEarnings: 0,
        preferredCurrency: 'usd',
        payoutSchedule: 'WEEKLY',
      },
    });
    
    console.log('✅ Celebrity profile created successfully!');
    console.log(`   Celebrity ID: ${celebrityProfile.id}`);
    console.log(`   Category: ${celebrityProfile.category}`);
    console.log(`   Price: $${celebrityProfile.price}`);
    console.log(`   Rating: ${celebrityProfile.rating}`);
    console.log(`   Verified: ${celebrityProfile.verified ? 'Yes' : 'No'}`);
    console.log(`   Active: ${celebrityProfile.isActive ? 'Yes' : 'No'}`);
    console.log(`   Featured: ${celebrityProfile.featured ? 'Yes' : 'No'}`);
    
    // Create some sample videos
    const sampleVideos = await Promise.all([
      prisma.sampleVideo.create({
        data: {
          celebrityId: celebrityProfile.id,
          title: 'Birthday Shout-out Sample',
          thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
          duration: '0:45',
          videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        },
      }),
      prisma.sampleVideo.create({
        data: {
          celebrityId: celebrityProfile.id,
          title: 'Motivational Message Sample',
          thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
          duration: '1:20',
          videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        },
      }),
    ]);
    
    console.log('✅ Sample videos created successfully!');
    console.log(`   Created ${sampleVideos.length} sample videos`);
    
    // Fetch the complete user with profile
    const completeUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        celebrityProfile: {
          include: {
            sampleVideos: true,
          },
        },
      },
    });
    
    console.log('\n🎉 CELEBRITY USER CREATED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log(`Name: ${completeUser.name}`);
    console.log(`Email: ${completeUser.email}`);
    console.log(`Password: celebrity123 (for testing)`);
    console.log(`Role: ${completeUser.role}`);
    console.log(`Category: ${completeUser.celebrityProfile.category}`);
    console.log(`Price: $${completeUser.celebrityProfile.price}`);
    console.log(`Rating: ${completeUser.celebrityProfile.rating}`);
    console.log(`Sample Videos: ${completeUser.celebrityProfile.sampleVideos.length}`);
    console.log(`Verified: ${completeUser.celebrityProfile.verified ? 'Yes' : 'No'}`);
    console.log(`Active: ${completeUser.celebrityProfile.isActive ? 'Yes' : 'No'}`);
    console.log(`Featured: ${completeUser.celebrityProfile.featured ? 'Yes' : 'No'}`);
    
    console.log('\n💡 Login Credentials:');
    console.log('Email: emma.stone@example.com');
    console.log('Password: celebrity123');
    
    console.log('\n🔗 Next Steps:');
    console.log('1. Start the application: npm run dev');
    console.log('2. Login with the credentials above');
    console.log('3. Access the celebrity dashboard');
    console.log('4. View and manage booking requests');
    
  } catch (error) {
    console.error('❌ Error creating celebrity user:', error);
    
    if (error.code === 'P2002') {
      console.log('\n💡 User already exists with this email.');
      console.log('Try a different email address.');
    }
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database disconnected');
  }
}

// Run the celebrity creation
createCelebrityUser();
