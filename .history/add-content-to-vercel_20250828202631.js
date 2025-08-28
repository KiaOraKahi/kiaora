import { PrismaClient } from '@prisma/client';

// Use the correct Vercel database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://f6b3594d231a10194416a318a056ea2946f16e73c093bca313bf296cc00343bf:sk_qcpY8_xIfgKD2qhKfZBra@db.prisma.io:5432/postgres?sslmode=require"
    }
  }
});

const homepageContent = [
  {
    key: "homepage.hero.title",
    value: "Kia Ora",
    type: "TEXT",
    category: "homepage",
    description: "Main hero title on homepage"
  },
  {
    key: "homepage.hero.subtitle",
    value: "Connect with your favorite celebrities",
    type: "TEXT",
    category: "homepage",
    description: "Hero subtitle on homepage"
  },
  {
    key: "homepage.how-it-works.step1.title",
    value: "Choose Your Celebrity",
    type: "TEXT",
    category: "homepage",
    description: "Step 1 title in how it works section"
  },
  {
    key: "homepage.how-it-works.step1.description",
    value: "Browse our curated list of celebrities and influencers",
    type: "TEXT",
    category: "homepage",
    description: "Step 1 description in how it works section"
  },
  {
    key: "homepage.how-it-works.step2.title",
    value: "Select Your Service",
    type: "TEXT",
    category: "homepage",
    description: "Step 2 title in how it works section"
  },
  {
    key: "homepage.how-it-works.step2.description",
    value: "Pick from personalized videos, shout-outs, or live calls",
    type: "TEXT",
    category: "homepage",
    description: "Step 2 description in how it works section"
  },
  {
    key: "homepage.how-it-works.step3.title",
    value: "Receive Your Video",
    type: "TEXT",
    category: "homepage",
    description: "Step 3 title in how it works section"
  },
  {
    key: "homepage.how-it-works.step3.description",
    value: "Get your personalized message delivered to your inbox",
    type: "TEXT",
    category: "homepage",
    description: "Step 3 description in how it works section"
  }
];

const footerContent = [
  {
    key: "footer.description",
    value: "Connect with celebrities for personalized video messages and experiences",
    type: "TEXT",
    category: "footer",
    description: "Footer description text"
  },
  {
    key: "footer.copyright",
    value: "© 2024 Kia Ora. All rights reserved.",
    type: "TEXT",
    category: "footer",
    description: "Footer copyright text"
  }
];

async function addContentToVercel() {
  try {
    console.log('Adding sample content to Vercel production database...');
    
    const allContent = [...homepageContent, ...footerContent];
    
    for (const contentData of allContent) {
      // Check if content already exists
      const existing = await prisma.content.findUnique({
        where: { key: contentData.key }
      });
      
      if (existing) {
        console.log(`Content "${contentData.key}" already exists, updating...`);
        await prisma.content.update({
          where: { key: contentData.key },
          data: {
            value: contentData.value,
            type: contentData.type,
            category: contentData.category,
            description: contentData.description,
            updatedBy: 'admin-seed'
          }
        });
      } else {
        console.log(`Creating content: ${contentData.key}`);
        await prisma.content.create({
          data: {
            key: contentData.key,
            value: contentData.value,
            type: contentData.type,
            category: contentData.category,
            description: contentData.description,
            status: "active",
            updatedBy: 'admin-seed'
          }
        });
      }
    }
    
    console.log('Sample content added/updated successfully in Vercel database!');
    
  } catch (error) {
    console.error('Error adding content to Vercel:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addContentToVercel();
