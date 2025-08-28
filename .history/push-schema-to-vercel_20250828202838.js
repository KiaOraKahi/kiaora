import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

// Set the Prisma Accelerate URL as environment variable
process.env.PRISMA_DATABASE_URL = "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XNjN0WUZkZ2tPb0ljeTFveVhRaVMiLCJhcGlfa2V5IjoiMDFLMzhaOFc";

async function pushSchemaToVercel() {
  try {
    console.log('Pushing schema to Vercel database...');
    
    // Use execSync to run prisma db push with the correct environment
    const result = execSync('npx prisma db push --accept-data-loss', {
      env: {
        ...process.env,
        PRISMA_DATABASE_URL: process.env.PRISMA_DATABASE_URL
      },
      stdio: 'inherit'
    });
    
    console.log('Schema pushed successfully to Vercel database!');
    
  } catch (error) {
    console.error('Error pushing schema to Vercel:', error);
  }
}

pushSchemaToVercel();
