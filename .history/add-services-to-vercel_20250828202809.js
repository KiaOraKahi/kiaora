import { PrismaClient } from '@prisma/client';

// Use the correct Vercel database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://f6b3594d231a10194416a318a056ea2946f16e73c093bca313bf296cc00343bf:sk_qcpY8_xIfgKD2qhKfZBra@db.prisma.io:5432/postgres?sslmode=require"
    }
  }
});

const sampleServices = [
  {
    title: "Quick Shout-Outs",
    shortDescription: "Fast and fun personalised shout-outs designed for quick interactions.",
    fullDescription: "Get instant energy with quick, personalised shout-outs from your favorite person. Perfect for birthdays, congratulations, or just to brighten someone's day with a burst of excitement.",
    icon: "Camera",
    color: "from-yellow-500 to-orange-500",
    startingPrice: 20,
    asapPrice: 50,
    duration: "30 seconds",
    deliveryTime: "1 - 3 days",
    asapDeliveryTime: "12hrs",
    popular: true,
    isActive: true,
    currency: "nzd",
    features: [
      "Quick personalised message",
      "Mention recipient's name",
      "HD video quality",
      "Fast turnaround",
      "Perfect for social sharing"
    ]
  },
  {
    title: "Personal & Motivational",
    shortDescription: "Custom video messages tailored specifically for you or your loved ones",
    fullDescription: "Deeply personal and motivational video messages crafted with care. Perfect for life milestones, personal encouragement, or meaningful connections.",
    icon: "MessageCircle",
    color: "from-blue-500 to-purple-500",
    startingPrice: 99,
    asapPrice: 150,
    duration: "1-3 minutes",
    deliveryTime: "3-5 days",
    asapDeliveryTime: "24hrs",
    popular: false,
    isActive: true,
    currency: "nzd",
    features: [
      "Fully customisable content",
      "Personal anecdotes when possible",
      "Detailed personalisation",
      "Emotional connection focus",
      "Longer format content"
    ]
  },
  {
    title: "Roast Someone",
    shortDescription: "Videos that tease or make fun of someone, in a good-natured way",
    fullDescription: "Light-hearted and playful roasts that bring laughter without crossing boundaries. Perfect for friendly banter and entertainment.",
    icon: "Heart",
    color: "from-pink-500 to-red-500",
    startingPrice: 250,
    asapPrice: 350,
    duration: "2-4 minutes",
    deliveryTime: "5-7 days",
    asapDeliveryTime: "48hrs",
    popular: false,
    isActive: true,
    currency: "nzd",
    features: [
      "Hilarious custom roasts",
      "Playful and friendly tone",
      "Comedic delivery",
      "Safe and respectful content",
      "Entertainment focused"
    ]
  },
  {
    title: "Live one-on-one Interaction",
    shortDescription: "Real-time video calls and live one on one interactions",
    fullDescription: "Connect directly with your favorite person through live video calls. Real-time interaction and personal connection.",
    icon: "Video",
    color: "from-purple-500 to-pink-500",
    startingPrice: 499,
    asapPrice: 650,
    duration: "5mins",
    deliveryTime: "As per customer request",
    asapDeliveryTime: "Scheduled",
    popular: false,
    isActive: true,
    currency: "nzd",
    features: [
      "Real-time video conversation",
      "Interactive Q&A session",
      "Screen recording included",
      "Scheduled appointments",
      "Direct personal connection"
    ]
  },
  {
    title: "Business endorsements",
    shortDescription: "Professional endorsements and business shout-outs",
    fullDescription: "Professional business endorsements and promotional content for your brand or product. Perfect for marketing and business growth.",
    icon: "Building",
    color: "from-green-500 to-blue-500",
    startingPrice: 199,
    asapPrice: 250,
    duration: "2-4 minutes",
    deliveryTime: "3-5 days",
    asapDeliveryTime: "24hrs",
    popular: false,
    isActive: true,
    currency: "nzd",
    features: [
      "Professional business endorsement",
      "Brand/product mentions",
      "Company milestone celebrations",
      "Marketing content",
      "Business-focused messaging"
    ]
  },
  {
    title: "Sign Language message",
    shortDescription: "We offer a service where we can have a sign language person in a little box signing the message? subtitles? what is acceptable",
    fullDescription: "Inclusive video messages with sign language interpretation. Making content accessible to the deaf and hard of hearing community.",
    icon: "Users",
    color: "from-indigo-500 to-purple-500",
    startingPrice: 150,
    asapPrice: 200,
    duration: "1-2 minutes",
    deliveryTime: "4-6 days",
    asapDeliveryTime: "48hrs",
    popular: false,
    isActive: true,
    currency: "nzd",
    features: [
      "Sign language interpretation",
      "Inclusive content",
      "Accessibility focused",
      "Subtitles included",
      "Community support"
    ]
  }
];

async function addSampleServicesToVercel() {
  try {
    console.log('Adding sample services to Vercel production database...');
    
    for (const serviceData of sampleServices) {
      // Check if service already exists
      const existing = await prisma.service.findFirst({
        where: { title: serviceData.title }
      });
      
      if (existing) {
        console.log(`Service "${serviceData.title}" already exists, skipping...`);
        continue;
      }

      // Create service
      const service = await prisma.service.create({
        data: {
          title: serviceData.title,
          shortDescription: serviceData.shortDescription,
          fullDescription: serviceData.fullDescription,
          icon: serviceData.icon,
          color: serviceData.color,
          startingPrice: serviceData.startingPrice,
          asapPrice: serviceData.asapPrice,
          duration: serviceData.duration,
          deliveryTime: serviceData.deliveryTime,
          asapDeliveryTime: serviceData.asapDeliveryTime,
          popular: serviceData.popular,
          isActive: serviceData.isActive,
          currency: serviceData.currency,
          order: 0,
          numericId: 0,
          createdBy: 'admin-seed',
          updatedBy: 'admin-seed'
        }
      });

      // Create features
      if (serviceData.features && serviceData.features.length > 0) {
        const featureData = serviceData.features.map((feature, index) => ({
          serviceId: service.id,
          text: feature,
          order: index
        }));

        await prisma.serviceFeature.createMany({
          data: featureData
        });
      }

      console.log(`Created service: ${serviceData.title}`);
    }
    
    console.log('Sample services added successfully to Vercel database!');
    
  } catch (error) {
    console.error('Error adding sample services to Vercel:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleServicesToVercel();
