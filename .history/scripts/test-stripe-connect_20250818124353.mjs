import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const prisma = new PrismaClient();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY is not set');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
});

async function testStripeConnect() {
  try {
    console.log('🔍 Testing Stripe Connect account creation...');
    
    // Test basic Stripe connection
    console.log('📡 Testing basic Stripe connection...');
    const customers = await stripe.customers.list({ limit: 1 });
    console.log('✅ Basic Stripe connection successful');
    
    // Test Connect account creation with minimal data
    console.log('📡 Testing Connect account creation...');
    
    const accountParams = {
      type: 'express',
      country: 'NZ',
      email: 'test@example.com',
      business_type: 'individual',
      individual: {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        product_description: 'Test celebrity video messages',
        mcc: '7922',
      },
      tos_acceptance: {
        service_agreement: 'recipient'
      }
    };
    
    console.log('📋 Account parameters:', JSON.stringify(accountParams, null, 2));
    
    const account = await stripe.accounts.create(accountParams);
    console.log('✅ Connect account created successfully:', account.id);
    
    // Clean up - delete the test account
    console.log('🧹 Cleaning up test account...');
    await stripe.accounts.del(account.id);
    console.log('✅ Test account deleted');
    
    console.log('🎉 All tests passed! Stripe Connect is working properly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('🔍 Error details:', {
      type: error instanceof Stripe.errors.StripeError ? error.type : 'Unknown',
      code: error instanceof Stripe.errors.StripeError ? error.code : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      param: error instanceof Stripe.errors.StripeError ? error.param : undefined,
    });
  } finally {
    await prisma.$disconnect();
  }
}

testStripeConnect();
