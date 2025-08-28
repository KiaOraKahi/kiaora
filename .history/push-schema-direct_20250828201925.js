import { PrismaClient } from '@prisma/client';

// Create Prisma client with Vercel database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XNjN0WUZkZ2tPb0ljeTFveVhRaVMiLCJhcGlfa2V5IjoiMDFLMzhaOFc"
    }
  }
});

async function pushSchemaDirect() {
  try {
    console.log('Connecting to Vercel database...');
    
    // Test the connection
    await prisma.$connect();
    console.log('Successfully connected to Vercel database!');
    
    // Check if Content table exists
    try {
      const contentCount = await prisma.content.count();
      console.log(`Content table exists with ${contentCount} records`);
    } catch (error) {
      console.log('Content table does not exist yet');
    }
    
    // Check if Service table exists
    try {
      const serviceCount = await prisma.service.count();
      console.log(`Service table exists with ${serviceCount} records`);
    } catch (error) {
      console.log('Service table does not exist yet');
    }
    
    console.log('Database connection test completed!');
    
  } catch (error) {
    console.error('Error connecting to Vercel database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

pushSchemaDirect();
