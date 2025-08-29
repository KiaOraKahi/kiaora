import { PrismaClient } from '@prisma/client';

// Use production database URL directly
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://e893fcb657947128bfda667435261cd0ce3bb99b2b03b135b1258741a3948bb7:sk_sn0rAw14woPhJErejkLgr@db.prisma.io:5432/postgres?sslmode=require"
    }
  }
});

async function initializeFinancialSettings() {
  try {
    console.log('🚀 Initializing financial settings...');

    // Check if financial settings already exist
    const existingSettings = await prisma.financialSettings.findFirst();

    if (existingSettings) {
      console.log('⚠️  Financial settings already exist');
      console.log('📊 Current settings:');
      console.log(`  - Platform Fee: ${existingSettings.platformFee}%`);
      console.log(`  - Minimum Payout: $${existingSettings.minimumPayout}`);
      console.log(`  - Payout Schedule: ${existingSettings.payoutSchedule}`);
      return;
    }

    // Create default financial settings
    const financialSettings = await prisma.financialSettings.create({
      data: {
        platformFee: 20.0, // 20% platform fee
        minimumPayout: 50.0, // $50 minimum payout
        payoutSchedule: "weekly", // Weekly payouts
        platformFeeBalance: 0.0, // Start with 0 balance
        adminStripeAccountStatus: "PENDING" // Pending until admin sets up Stripe
      }
    });

    console.log('✅ Financial settings initialized successfully!');
    console.log('📊 Default settings:');
    console.log(`  - Platform Fee: ${financialSettings.platformFee}%`);
    console.log(`  - Minimum Payout: $${financialSettings.minimumPayout}`);
    console.log(`  - Payout Schedule: ${financialSettings.payoutSchedule}`);
    console.log(`  - Platform Fee Balance: $${financialSettings.platformFeeBalance}`);
    
    console.log('\n🎯 Next steps:');
    console.log('1. Go to admin dashboard');
    console.log('2. Navigate to Platform Fees tab');
    console.log('3. Setup Stripe Connect account for admin');
    console.log('4. Configure payout settings');

  } catch (error) {
    console.error('❌ Error initializing financial settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeFinancialSettings();
