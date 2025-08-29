import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function populateSampleData() {
  try {
    console.log('🚀 Populating database with sample data...');

    // Sample content data
    const sampleContent = [
      {
        key: "homepage.hero.title",
        value: "Kia Ora - Connect with Celebrities",
        type: "TEXT",
        category: "Homepage",
        description: "Main hero title on homepage"
      },
      {
        key: "homepage.hero.subtitle",
        value: "Get personalized video messages from your favorite stars",
        type: "TEXT",
        category: "Homepage",
        description: "Hero subtitle on homepage"
      },
      {
        key: "homepage.hero.description",
        value: "Connect with celebrities for personalized video messages that make every occasion special",
        type: "TEXT",
        category: "Homepage",
        description: "Hero description on homepage"
      },
      {
        key: "homepage.cta.primary",
        value: "Browse Celebrities",
        type: "TEXT",
        category: "Homepage",
        description: "Primary CTA button text"
      },
      {
        key: "homepage.cta.secondary",
        value: "Learn More",
        type: "TEXT",
        category: "Homepage",
        description: "Secondary CTA button text"
      },
      {
        key: "homepage.how-it-works.title",
        value: "How It Works",
        type: "TEXT",
        category: "How it-works",
        description: "How it works section title"
      },
      {
        key: "homepage.how-it-works.step1.title",
        value: "Browse & Discover",
        type: "TEXT",
        category: "How it-works",
        description: "Step 1 title"
      },
      {
        key: "homepage.how-it-works.step1.description",
        value: "Explore our verified celebrities across entertainment, sports, and more",
        type: "TEXT",
        category: "How it-works",
        description: "Step 1 description"
      },
      {
        key: "homepage.how-it-works.step2.title",
        value: "Personalise Your Request",
        type: "TEXT",
        category: "How it-works",
        description: "Step 2 title"
      },
      {
        key: "homepage.how-it-works.step2.description",
        value: "Tell us exactly what you want and who it's for",
        type: "TEXT",
        category: "How it-works",
        description: "Step 2 description"
      },
      {
        key: "homepage.how-it-works.step3.title",
        value: "Secure Payment",
        type: "TEXT",
        category: "How it-works",
        description: "Step 3 title"
      },
      {
        key: "homepage.how-it-works.step3.description",
        value: "Complete your booking with our secure payment system",
        type: "TEXT",
        category: "How it-works",
        description: "Step 3 description"
      },
      {
        key: "homepage.how-it-works.step4.title",
        value: "Receive Your Video",
        type: "TEXT",
        category: "How it-works",
        description: "Step 4 title"
      },
      {
        key: "homepage.how-it-works.step4.description",
        value: "Get your personalised video within the promised timeframe",
        type: "TEXT",
        category: "How it-works",
        description: "Step 4 description"
      },
      {
        key: "homepage.featured.title",
        value: "Featured Celebrities",
        type: "TEXT",
        category: "Homepage",
        description: "Featured celebrities section title"
      },
      {
        key: "homepage.featured.subtitle",
        value: "Discover amazing talent ready to create your perfect message",
        type: "TEXT",
        category: "Homepage",
        description: "Featured celebrities subtitle"
      },
      {
        key: "homepage.services.title",
        value: "Our Services",
        type: "TEXT",
        category: "Homepage",
        description: "Services section title"
      },
      {
        key: "homepage.services.subtitle",
        value: "Find the perfect celebrity for any occasion",
        type: "TEXT",
        category: "Homepage",
        description: "Services section subtitle"
      },
      {
        key: "footer.copyright",
        value: "© 2025 Kia Ora. All rights reserved.",
        type: "TEXT",
        category: "Footer",
        description: "Footer copyright text"
      },
      {
        key: "footer.description",
        value: "Connect with celebrities for personalized video messages",
        type: "TEXT",
        category: "Footer",
        description: "Footer description"
      },
      {
        key: "nav.home",
        value: "Home",
        type: "TEXT",
        category: "Navigation",
        description: "Navigation home link"
      },
      {
        key: "nav.about",
        value: "About",
        type: "TEXT",
        category: "Navigation",
        description: "Navigation about link"
      },
      {
        key: "nav.celebrities",
        value: "Celebrities",
        type: "TEXT",
        category: "Navigation",
        description: "Navigation celebrities link"
      },
      {
        key: "nav.how-it-works",
        value: "How It Works",
        type: "TEXT",
        category: "Navigation",
        description: "Navigation how it works link"
      },
      {
        key: "nav.pricing",
        value: "Pricing",
        type: "TEXT",
        category: "Navigation",
        description: "Navigation pricing link"
      },
      {
        key: "nav.contact",
        value: "Contact",
        type: "TEXT",
        category: "Navigation",
        description: "Navigation contact link"
      },
      {
        key: "ui.buttons.submit",
        value: "Submit",
        type: "TEXT",
        category: "UI Labels",
        description: "Submit button text"
      },
      {
        key: "ui.buttons.cancel",
        value: "Cancel",
        type: "TEXT",
        category: "UI Labels",
        description: "Cancel button text"
      },
      {
        key: "ui.buttons.browse",
        value: "Browse",
        type: "TEXT",
        category: "UI Labels",
        description: "Browse button text"
      },
      {
        key: "ui.buttons.learn-more",
        value: "Learn More",
        type: "TEXT",
        category: "UI Labels",
        description: "Learn more button text"
      }
    ];

    // Sample services data
    const sampleServices = [
      {
        title: "Personal Video Message",
        shortDescription: "Get a personalized video message from your favorite celebrity",
        fullDescription: "Receive a heartfelt, personalized video message from celebrities for birthdays, anniversaries, or any special occasion. Perfect for making someone's day truly unforgettable.",
        icon: "Video",
        color: "from-blue-500 to-purple-500",
        startingPrice: 299,
        asapPrice: 399,
        duration: "30-60 seconds",
        deliveryTime: "3-5 business days",
        asapDeliveryTime: "24 hours",
        popular: true,
        isActive: true,
        currency: "nzd",
        features: [
          "Personalized message",
          "High quality video",
          "Downloadable format",
          "Celebrity choice",
          "Message customization"
        ]
      },
      {
        title: "Birthday Wishes",
        shortDescription: "Special birthday messages from celebrities",
        fullDescription: "Make birthdays extra special with personalized birthday wishes from celebrities. Perfect for surprising friends and family with messages from their favorite stars.",
        icon: "Gift",
        color: "from-pink-500 to-red-500",
        startingPrice: 199,
        asapPrice: 299,
        duration: "15-30 seconds",
        deliveryTime: "2-3 business days",
        asapDeliveryTime: "12 hours",
        popular: false,
        isActive: true,
        currency: "nzd",
        features: [
          "Birthday specific content",
          "Age-appropriate messaging",
          "Quick delivery options",
          "Celebrity variety",
          "Personal touch"
        ]
      },
      {
        title: "Business Promotion",
        shortDescription: "Celebrity endorsements for your business",
        fullDescription: "Boost your business with celebrity endorsements and promotional videos. Perfect for product launches, company events, or marketing campaigns.",
        icon: "Building",
        color: "from-green-500 to-blue-500",
        startingPrice: 599,
        asapPrice: 799,
        duration: "60-90 seconds",
        deliveryTime: "5-7 business days",
        asapDeliveryTime: "48 hours",
        popular: false,
        isActive: true,
        currency: "nzd",
        features: [
          "Professional endorsement",
          "Business focused content",
          "Extended duration",
          "Commercial usage rights",
          "High production value"
        ]
      },
      {
        title: "Motivational Message",
        shortDescription: "Inspirational messages from motivational speakers",
        fullDescription: "Get inspired with motivational messages from renowned speakers and celebrities. Perfect for team building, personal development, or overcoming challenges.",
        icon: "Target",
        color: "from-yellow-500 to-orange-500",
        startingPrice: 399,
        asapPrice: 499,
        duration: "45-60 seconds",
        deliveryTime: "3-4 business days",
        asapDeliveryTime: "24 hours",
        popular: true,
        isActive: true,
        currency: "nzd",
        features: [
          "Inspirational content",
          "Professional speakers",
          "Custom motivation",
          "Team building focus",
          "Personal development"
        ]
      }
    ];

    console.log('📝 Creating sample content...');
    
    // Create content items
    for (const contentItem of sampleContent) {
      const existingContent = await prisma.content.findUnique({
        where: { key: contentItem.key }
      });
      
      if (!existingContent) {
        await prisma.content.create({
          data: {
            key: contentItem.key,
            value: contentItem.value,
            type: contentItem.type,
            category: contentItem.category,
            description: contentItem.description,
            status: "active"
          }
        });
        console.log(`✅ Created content: ${contentItem.key}`);
      } else {
        console.log(`⚠️  Content already exists: ${contentItem.key}`);
      }
    }

    console.log('🎯 Creating sample services...');
    
    // Create services
    for (const serviceData of sampleServices) {
      const existingService = await prisma.service.findFirst({
        where: { title: serviceData.title }
      });
      
      if (!existingService) {
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
            order: 0
          }
        });

        // Create features for the service
        for (let i = 0; i < serviceData.features.length; i++) {
          await prisma.serviceFeature.create({
            data: {
              serviceId: service.id,
              text: serviceData.features[i],
              order: i
            }
          });
        }
        
        console.log(`✅ Created service: ${serviceData.title}`);
      } else {
        console.log(`⚠️  Service already exists: ${serviceData.title}`);
      }
    }

    console.log('🎉 Sample data population completed!');
    
    // Show summary
    const contentCount = await prisma.content.count();
    const serviceCount = await prisma.service.count();
    
    console.log(`\n📊 Summary:`);
    console.log(`  - Content items: ${contentCount}`);
    console.log(`  - Services: ${serviceCount}`);

  } catch (error) {
    console.error('❌ Error populating sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateSampleData(); 