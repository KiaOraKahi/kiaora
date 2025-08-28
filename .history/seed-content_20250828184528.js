import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleContent = [
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
    key: "about.title",
    value: "About Kia Ora",
    type: "TEXT",
    category: "About",
    description: "About page title",
    status: "active"
  },
  {
    key: "about.description",
    value: "We connect fans with their favorite celebrities for personalized video messages.",
    type: "TEXT",
    category: "About",
    description: "About page description",
    status: "active"
  },
  {
    key: "faq.title",
    value: "Frequently Asked Questions",
    type: "TEXT",
    category: "FAQ",
    description: "FAQ page title",
    status: "active"
  },
  {
    key: "faq.question1",
    value: "How does Kia Ora work?",
    type: "TEXT",
    category: "FAQ",
    description: "First FAQ question",
    status: "active"
  },
  {
    key: "faq.answer1",
    value: "Simply browse celebrities, select one, and request a personalized video message.",
    type: "TEXT",
    category: "FAQ",
    description: "First FAQ answer",
    status: "active"
  },
  {
    key: "pricing.title",
    value: "Pricing Plans",
    type: "TEXT",
    category: "Pricing",
    description: "Pricing page title",
    status: "active"
  },
  {
    key: "footer.copyright",
    value: "© 2025 Kia Ora. All rights reserved.",
    type: "TEXT",
    category: "Footer",
    description: "Footer copyright text",
    status: "active"
  },
  {
    key: "navigation.home",
    value: "Home",
    type: "TEXT",
    category: "Navigation",
    description: "Home navigation link",
    status: "active"
  },
  {
    key: "navigation.about",
    value: "About",
    type: "TEXT",
    category: "Navigation",
    description: "About navigation link",
    status: "active"
  },
  {
    key: "ui.labels.submit",
    value: "Submit",
    type: "TEXT",
    category: "UI Labels",
    description: "Submit button label",
    status: "active"
  },
  {
    key: "ui.labels.cancel",
    value: "Cancel",
    type: "TEXT",
    category: "UI Labels",
    description: "Cancel button label",
    status: "active"
  },
  {
    key: "emails.welcome.subject",
    value: "Welcome to Kia Ora!",
    type: "TEXT",
    category: "Emails",
    description: "Welcome email subject",
    status: "active"
  },
  {
    key: "emails.welcome.body",
    value: "Thank you for joining Kia Ora. Start connecting with celebrities today!",
    type: "TEXT",
    category: "Emails",
    description: "Welcome email body",
    status: "active"
  }
];

async function seedContent() {
  try {
    console.log('Seeding content...');
    
    // Clear existing content
    await prisma.content.deleteMany({});
    console.log('Cleared existing content');
    
    // Insert sample content
    for (const content of sampleContent) {
      await prisma.content.create({
        data: {
          ...content,
          updatedBy: 'admin-seed'
        }
      });
    }
    
    console.log(`Successfully seeded ${sampleContent.length} content items`);
    
    // Verify the content was created
    const count = await prisma.content.count();
    console.log(`Total content items in database: ${count}`);
    
  } catch (error) {
    console.error('Error seeding content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedContent();
