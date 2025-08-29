import { PrismaClient } from '@prisma/client';

// Use production database URL directly
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://e893fcb657947128bfda667435261cd0ce3bb99b2b03b135b1258741a3948bb7:sk_sn0rAw14woPhJErejkLgr@db.prisma.io:5432/postgres?sslmode=require"
    }
  }
});

async function createTestApplication() {
  try {
    console.log('🚀 Creating test celebrity application...');

    // Check if test application already exists
    const existingApplication = await prisma.celebrityApplication.findUnique({
      where: { email: "testcelebrity@example.com" }
    });

    if (existingApplication) {
      console.log('⚠️  Test application already exists');
      return;
    }

    // Create test celebrity application
    const testApplication = await prisma.celebrityApplication.create({
      data: {
        fullName: "Test Celebrity",
        email: "testcelebrity@example.com",
        phone: "+1234567890",
        dateOfBirth: "1990-01-15",
        nationality: "New Zealand",
        category: "Influencer",
        experience: "I am a social media influencer with over 100k followers across Instagram and TikTok. I create engaging content and have experience in brand collaborations and personal video messages.",
        achievements: "Featured in multiple brand campaigns, collaborated with major companies, created viral content with millions of views",
        profession: "Social Media Influencer",
        availability: "24 hours",
        basePrice: 299.0,
        rushPrice: 399.0,
        followerCount: "100000",
        motivation: "I want to connect with fans and create meaningful personalized content while building my personal brand.",
        instagramHandle: "@testcelebrity",
        twitterHandle: "@testcelebrity",
        tiktokHandle: "@testcelebrity",
        youtubeHandle: "@testcelebrity",
        languages: ["English", "Maori"],
        specialRequests: "I prefer to create content during daylight hours for better lighting quality.",
        hasProfilePhoto: true,
        hasIdDocument: true,
        hasVerificationDocument: true,
        profilePhotoUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
        idDocumentUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop",
        verificationDocumentUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop",
        status: "PENDING"
      }
    });

    console.log('✅ Test celebrity application created successfully!');
    console.log(`📝 Application ID: ${testApplication.id}`);
    console.log(`👤 Name: ${testApplication.fullName}`);
    console.log(`📧 Email: ${testApplication.email}`);
    console.log(`📊 Status: ${testApplication.status}`);
    
    console.log('\n🎯 Now you can:');
    console.log('1. Go to admin dashboard');
    console.log('2. Navigate to Applications tab');
    console.log('3. See the test application in the list');
    console.log('4. Click "Review" to approve or reject it');
    console.log('5. When approved, it will create a celebrity profile automatically');

  } catch (error) {
    console.error('❌ Error creating test application:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestApplication(); 