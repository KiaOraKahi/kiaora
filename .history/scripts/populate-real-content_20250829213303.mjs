import { PrismaClient } from '@prisma/client';

// Use production database URL directly
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://e893fcb657947128bfda667435261cd0ce3bb99b2b03b135b1258741a3948bb7:sk_sn0rAw14woPhJErejkLgr@db.prisma.io:5432/postgres?sslmode=require"
    }
  }
});

async function populateRealContent() {
  try {
    console.log('🚀 Populating database with real website content...');

    // Real content that matches what's currently being used on the website
    const realContent = [
      // Homepage Hero Section
      {
        key: "homepage.hero.title",
        value: "Kia Ora",
        type: "TEXT",
        category: "Homepage",
        description: "Main hero title on homepage"
      },
      {
        key: "homepage.hero.subtitle",
        value: "Connect with your favorite celebrities",
        type: "TEXT",
        category: "Homepage",
        description: "Hero subtitle on homepage"
      },
      {
        key: "homepage.hero.description",
        value: "Get personalized video messages from the stars you love",
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

      // How It Works Section
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

      // Featured Section
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

      // Services Section
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

      // Footer Content
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

      // Navigation
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

      // UI Labels
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

    // Real services that match what's currently being used
    const realServices = [
      {
        title: "Quick shout-outs",
        shortDescription: "Fast and fun personalised shout-outs",
        fullDescription: "Get instant energy with quick, personalized shout-outs from your favorite talent. Perfect for birthdays, congratulations, or just to brighten someone's day with a burst of celebrity excitement.",
        icon: "Zap",
        color: "from-yellow-500 to-orange-500",
        startingPrice: 20,
        asapPrice: 40,
        duration: "30 sec - 1min",
        deliveryTime: "1 - 3 days",
        asapDeliveryTime: "12hrs",
        popular: true,
        isActive: true,
        currency: "usd",
        features: [
          "Quick personalized message",
          "Mention recipient's name",
          "High-energy delivery",
          "HD video quality",
          "Fast turnaround",
          "Perfect for social sharing"
        ]
      },
      {
        title: "Personalised video messages",
        shortDescription: "Custom video messages tailored specifically for you or your loved ones",
        fullDescription: "Experience the magic of a fully personalized video message crafted specifically for you or your loved ones. Our talent takes time to create meaningful, heartfelt content that will be treasured forever.",
        icon: "MessageCircle",
        color: "from-blue-500 to-cyan-500",
        startingPrice: 149,
        asapPrice: 299,
        duration: "1 - 3 minutes",
        deliveryTime: "2 - 5 days",
        asapDeliveryTime: "24hrs",
        popular: true,
        isActive: true,
        currency: "usd",
        features: [
          "Fully customizable content",
          "Personal anecdotes when possible",
          "Detailed personalization",
          "HD video quality",
          "Unlimited replays",
          "Digital download included"
        ]
      },
      {
        title: "Celebrity roasts",
        shortDescription: "Funny and lighthearted roasts from your favorite comedians",
        fullDescription: "Get a hilarious, personalized roast from top comedians and celebrities. Perfect for birthdays, bachelor parties, or when you want to add some humor to any occasion.",
        icon: "Laugh",
        color: "from-pink-500 to-red-500",
        startingPrice: 99,
        asapPrice: 199,
        duration: "1 - 2 minutes",
        deliveryTime: "3 - 5 days",
        asapDeliveryTime: "24hrs",
        popular: false,
        isActive: true,
        currency: "usd",
        features: [
          "Hilarious personalized content",
          "Professional comedians",
          "Lighthearted and fun",
          "Perfect for celebrations",
          "HD video quality",
          "Safe for all audiences"
        ]
      },
      {
        title: "Business endorsements",
        shortDescription: "Professional endorsements for your business or product",
        fullDescription: "Boost your business credibility with professional endorsements from celebrities and influencers. Perfect for product launches, company events, or marketing campaigns.",
        icon: "Briefcase",
        color: "from-green-500 to-blue-500",
        startingPrice: 299,
        asapPrice: 499,
        duration: "1 - 2 minutes",
        deliveryTime: "5 - 7 days",
        asapDeliveryTime: "48hrs",
        popular: false,
        isActive: true,
        currency: "usd",
        features: [
          "Professional endorsement",
          "Business focused content",
          "Commercial usage rights",
          "High production value",
          "Extended duration",
          "Perfect for marketing"
        ]
      }
    ];

    console.log('📝 Creating real content...');
    
    // Create content items
    for (const contentItem of realContent) {
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

    console.log('🎯 Creating real services...');
    
    // Create services
    for (const serviceData of realServices) {
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

    console.log('🎉 Real content population completed!');
    
    // Show summary
    const contentCount = await prisma.content.count();
    const serviceCount = await prisma.service.count();
    
    console.log(`\n📊 Summary:`);
    console.log(`  - Content items: ${contentCount}`);
    console.log(`  - Services: ${serviceCount}`);
    console.log(`\n✨ Now you can:`);
    console.log(`  1. Go to admin dashboard and edit content`);
    console.log(`  2. Changes will reflect immediately on the website`);
    console.log(`  3. Filter content by category (Homepage, How it-works, etc.)`);

  } catch (error) {
    console.error('❌ Error populating real content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateRealContent(); 