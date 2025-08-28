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
    shortDescription: "Personalized video messages from your favorite celebrities",
    fullDescription: "Get a personalized video shout-out from your favorite celebrity. Perfect for birthdays, anniversaries, or just to make someone's day special. Celebrities will mention the recipient's name and deliver a heartfelt message.",
    icon: "MessageCircle",
    color: "from-blue-500 to-purple-500",
    startingPrice: 50.00,
    asapPrice: 75.00,
    duration: "30 seconds",
    deliveryTime: "3-5 business days",
    asapDeliveryTime: "24 hours",
    popular: true,
    features: [
      "Personalized message with recipient's name",
      "High-quality video recording",
      "Downloadable video file",
      "Perfect for special occasions"
    ]
  },
  {
    title: "Live Video Calls",
    shortDescription: "Real-time video conversations with celebrities",
    fullDescription: "Connect live with your favorite celebrity through a video call. Have a real conversation, ask questions, or just chat. This is the ultimate fan experience for meaningful interactions.",
    icon: "Video",
    color: "from-green-500 to-blue-500",
    startingPrice: 200.00,
    asapPrice: 300.00,
    duration: "15 minutes",
    deliveryTime: "Scheduled within 1 week",
    asapDeliveryTime: "Within 24 hours",
    popular: false,
    features: [
      "Live video conversation",
      "Real-time interaction",
      "Screen sharing capability",
      "Recording option available"
    ]
  },
  {
    title: "Business Endorsements",
    shortDescription: "Professional endorsements for your business",
    fullDescription: "Get a celebrity endorsement for your business or product. Celebrities will create professional videos promoting your brand, perfect for marketing campaigns and social media content.",
    icon: "Building",
    color: "from-purple-500 to-pink-500",
    startingPrice: 500.00,
    asapPrice: 750.00,
    duration: "60 seconds",
    deliveryTime: "5-7 business days",
    asapDeliveryTime: "48 hours",
    popular: false,
    features: [
      "Professional endorsement video",
      "Brand mention and promotion",
      "Commercial usage rights",
      "High-quality production"
    ]
  },
  {
    title: "Birthday Wishes",
    shortDescription: "Special birthday messages from celebrities",
    fullDescription: "Make birthdays unforgettable with personalized birthday wishes from celebrities. They'll sing, dance, or deliver a special message to make the birthday person feel truly special.",
    icon: "Gift",
    color: "from-pink-500 to-red-500",
    startingPrice: 75.00,
    asapPrice: 100.00,
    duration: "45 seconds",
    deliveryTime: "2-3 business days",
    asapDeliveryTime: "12 hours",
    popular: true,
    features: [
      "Personalized birthday message",
      "Age-appropriate content",
      "Fun and engaging delivery",
      "Perfect for all ages"
    ]
  },
  {
    title: "Motivational Speeches",
    shortDescription: "Inspirational messages to boost motivation",
    fullDescription: "Get motivated with personalized speeches from celebrities. Whether it's for a team meeting, graduation, or personal motivation, celebrities will deliver inspiring messages tailored to your needs.",
    icon: "Target",
    color: "from-yellow-500 to-orange-500",
    startingPrice: 150.00,
    asapPrice: 225.00,
    duration: "90 seconds",
    deliveryTime: "4-6 business days",
    asapDeliveryTime: "36 hours",
    popular: false,
    features: [
      "Personalized motivational content",
      "Professional delivery",
      "Suitable for various audiences",
      "Inspiring and uplifting"
    ]
  },
  {
    title: "Event Invitations",
    shortDescription: "Celebrity-hosted event invitations",
    fullDescription: "Make your event invitations stand out with a celebrity host. Celebrities will create engaging invitation videos that will get people excited about attending your event.",
    icon: "Calendar",
    color: "from-indigo-500 to-purple-500",
    startingPrice: 100.00,
    asapPrice: 150.00,
    duration: "60 seconds",
    deliveryTime: "3-4 business days",
    asapDeliveryTime: "24 hours",
    popular: false,
    features: [
      "Event-specific invitation",
      "Engaging presentation",
      "Call-to-action included",
      "Professional quality"
    ]
  }
];

async function addSampleServicesToVercel() {
  try {
    console.log('Adding sample services to Vercel production database...');
    
    // Get the next available numericId
    const lastService = await prisma.service.findFirst({
      orderBy: { numericId: 'desc' }
    });
    
    let nextNumericId = 1;
    if (lastService) {
      nextNumericId = lastService.numericId + 1;
    }
    
    for (const serviceData of sampleServices) {
      // Check if service already exists by title
      const existing = await prisma.service.findFirst({
        where: { title: serviceData.title }
      });
      
      if (existing) {
        console.log(`Service "${serviceData.title}" already exists, updating...`);
        
        // Update existing service
        await prisma.service.update({
          where: { id: existing.id },
          data: {
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
            currency: 'nzd',
            order: 0,
            updatedBy: 'admin-seed'
          }
        });
        
        // Update features
        await prisma.serviceFeature.deleteMany({
          where: { serviceId: existing.id }
        });
        
        await prisma.serviceFeature.createMany({
          data: serviceData.features.map((feature, index) => ({
            serviceId: existing.id,
            text: feature,
            order: index
          }))
        });
        
      } else {
        console.log(`Creating service: ${serviceData.title}`);
        
        // Create new service
        const newService = await prisma.service.create({
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
            currency: 'nzd',
            order: 0,
            numericId: nextNumericId++,
            createdBy: 'admin-seed',
            updatedBy: 'admin-seed'
          }
        });
        
        // Create features
        await prisma.serviceFeature.createMany({
          data: serviceData.features.map((feature, index) => ({
            serviceId: newService.id,
            text: feature,
            order: index
          }))
        });
      }
    }
    
    console.log('Sample services added/updated successfully in Vercel database!');
    
  } catch (error) {
    console.error('Error adding sample services to Vercel:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleServicesToVercel();
