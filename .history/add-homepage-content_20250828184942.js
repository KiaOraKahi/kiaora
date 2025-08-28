import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const homepageContent = [
  // Hero Section
  {
    key: "homepage.hero.title",
    value: "Kia Ora",
    type: "TEXT",
    category: "Homepage",
    description: "Main hero title on homepage",
    status: "active"
  },
  {
    key: "homepage.hero.subtitle",
    value: "Connect with your favorite celebrities",
    type: "TEXT",
    category: "Homepage",
    description: "Hero subtitle text",
    status: "active"
  },
  {
    key: "homepage.hero.description",
    value: "Get personalized video messages from the stars you love",
    type: "TEXT",
    category: "Homepage",
    description: "Hero description text",
    status: "active"
  },
  {
    key: "homepage.cta.primary",
    value: "Browse Celebrities",
    type: "TEXT",
    category: "Homepage",
    description: "Primary CTA button text",
    status: "active"
  },
  {
    key: "homepage.cta.secondary",
    value: "Learn More",
    type: "TEXT",
    category: "Homepage",
    description: "Secondary CTA button text",
    status: "active"
  },

  // How It Works Section
  {
    key: "homepage.how-it-works.title",
    value: "How It Works",
    type: "TEXT",
    category: "Homepage",
    description: "How it works section title",
    status: "active"
  },
  {
    key: "homepage.how-it-works.step1.title",
    value: "Browse & Discover",
    type: "TEXT",
    category: "Homepage",
    description: "Step 1 title",
    status: "active"
  },
  {
    key: "homepage.how-it-works.step1.description",
    value: "Explore our verified celebrities across entertainment, sports, and more",
    type: "TEXT",
    category: "Homepage",
    description: "Step 1 description",
    status: "active"
  },
  {
    key: "homepage.how-it-works.step2.title",
    value: "Personalise Your Request",
    type: "TEXT",
    category: "Homepage",
    description: "Step 2 title",
    status: "active"
  },
  {
    key: "homepage.how-it-works.step2.description",
    value: "Tell us exactly what you want and who it's for",
    type: "TEXT",
    category: "Homepage",
    description: "Step 2 description",
    status: "active"
  },
  {
    key: "homepage.how-it-works.step3.title",
    value: "Secure Payment",
    type: "TEXT",
    category: "Homepage",
    description: "Step 3 title",
    status: "active"
  },
  {
    key: "homepage.how-it-works.step3.description",
    value: "Complete your booking with our secure payment system",
    type: "TEXT",
    category: "Homepage",
    description: "Step 3 description",
    status: "active"
  },
  {
    key: "homepage.how-it-works.step4.title",
    value: "Receive Your Video",
    type: "TEXT",
    category: "Homepage",
    description: "Step 4 title",
    status: "active"
  },
  {
    key: "homepage.how-it-works.step4.description",
    value: "Get your personalised video within the promised timeframe",
    type: "TEXT",
    category: "Homepage",
    description: "Step 4 description",
    status: "active"
  },

  // Featured Section
  {
    key: "homepage.featured.title",
    value: "Featured Celebrities",
    type: "TEXT",
    category: "Homepage",
    description: "Featured celebrities section title",
    status: "active"
  },
  {
    key: "homepage.featured.subtitle",
    value: "Discover amazing talent ready to create your perfect message",
    type: "TEXT",
    category: "Homepage",
    description: "Featured celebrities subtitle",
    status: "active"
  },

  // Services Section
  {
    key: "homepage.services.title",
    value: "Our Services",
    type: "TEXT",
    category: "Homepage",
    description: "Services section title",
    status: "active"
  },
  {
    key: "homepage.services.subtitle",
    value: "Find the perfect celebrity for any occasion",
    type: "TEXT",
    category: "Homepage",
    description: "Services section subtitle",
    status: "active"
  }
];

async function addHomepageContent() {
  try {
    console.log('Adding homepage content...');
    
    for (const content of homepageContent) {
      // Check if content already exists
      const existing = await prisma.content.findUnique({
        where: { key: content.key }
      });
      
      if (existing) {
        // Update existing content
        await prisma.content.update({
          where: { key: content.key },
          data: content
        });
        console.log(`Updated: ${content.key}`);
      } else {
        // Create new content
        await prisma.content.create({
          data: {
            ...content,
            updatedBy: 'admin-seed'
          }
        });
        console.log(`Created: ${content.key}`);
      }
    }
    
    console.log('Homepage content added successfully!');
    
  } catch (error) {
    console.error('Error adding homepage content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addHomepageContent();
