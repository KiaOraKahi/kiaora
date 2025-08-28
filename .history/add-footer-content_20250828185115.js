import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const footerContent = [
  {
    key: "footer.description",
    value: "Connect with your favorite talent for personalised messages, birthday greetings, and exclusive experiences. Making dreams come true, one message at a time.",
    type: "TEXT",
    category: "Footer",
    description: "Footer description text",
    status: "active"
  },
  {
    key: "footer.copyright",
    value: "© 2025 Kia Ora Kahi. All rights reserved.",
    type: "TEXT",
    category: "Footer",
    description: "Footer copyright text",
    status: "active"
  }
];

async function addFooterContent() {
  try {
    console.log('Adding footer content...');
    
    for (const content of footerContent) {
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
    
    console.log('Footer content added successfully!');
    
  } catch (error) {
    console.error('Error adding footer content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addFooterContent();
