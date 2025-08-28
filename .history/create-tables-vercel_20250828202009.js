import { PrismaClient } from '@prisma/client';

// Create Prisma client with Vercel database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XNjN0WUZkZ2tPb0ljeTFveVhRaVMiLCJhcGlfa2V5IjoiMDFLMzhaOFc"
    }
  }
});

async function createTables() {
  try {
    console.log('Creating tables in Vercel database...');
    
    // Create Content table
    console.log('Creating Content table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Content" (
        "id" TEXT NOT NULL,
        "key" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'TEXT',
        "category" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'active',
        "description" TEXT,
        "updatedBy" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // Create unique index for Content key
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Content_key_key" ON "Content"("key");
    `;
    
    // Create Service table
    console.log('Creating Service table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "services" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "shortDescription" TEXT NOT NULL,
        "fullDescription" TEXT NOT NULL,
        "icon" TEXT NOT NULL,
        "color" TEXT NOT NULL,
        "startingPrice" DOUBLE PRECISION NOT NULL,
        "asapPrice" DOUBLE PRECISION NOT NULL,
        "duration" TEXT NOT NULL,
        "deliveryTime" TEXT NOT NULL,
        "asapDeliveryTime" TEXT NOT NULL,
        "popular" BOOLEAN NOT NULL DEFAULT false,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "updatedBy" TEXT,
        "createdBy" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "currency" TEXT NOT NULL DEFAULT 'nzd',
        "numericId" INTEGER NOT NULL,
        "samples" JSONB NOT NULL DEFAULT '[]',
        "talents" JSONB NOT NULL DEFAULT '[]',
        CONSTRAINT "services_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // Create unique index for Service numericId
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "services_numericId_key" ON "services"("numericId");
    `;
    
    // Create ServiceFeature table
    console.log('Creating ServiceFeature table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "service_features" (
        "id" TEXT NOT NULL,
        "serviceId" TEXT NOT NULL,
        "text" TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "service_features_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // Create foreign key for ServiceFeature
    await prisma.$executeRaw`
      ALTER TABLE "service_features" ADD CONSTRAINT "service_features_serviceId_fkey" 
      FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `;
    
    // Create sequence for Service numericId
    await prisma.$executeRaw`
      CREATE SEQUENCE IF NOT EXISTS "services_numericId_seq" 
      START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
    `;
    
    // Set the sequence as default for numericId
    await prisma.$executeRaw`
      ALTER TABLE "services" ALTER COLUMN "numericId" SET DEFAULT nextval('services_numericId_seq');
    `;
    
    console.log('All tables created successfully!');
    
    // Test the tables
    console.log('Testing table creation...');
    
    try {
      const contentCount = await prisma.content.count();
      console.log(`✅ Content table exists with ${contentCount} records`);
    } catch (error) {
      console.log('❌ Content table test failed:', error.message);
    }
    
    try {
      const serviceCount = await prisma.service.count();
      console.log(`✅ Service table exists with ${serviceCount} records`);
    } catch (error) {
      console.log('❌ Service table test failed:', error.message);
    }
    
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTables();
