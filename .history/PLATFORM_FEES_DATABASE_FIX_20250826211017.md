# 🔧 Platform Fees Database Fix Guide

## 🚨 Issue Description

The admin platform fees functionality is showing "Failed to load platform fee data" because the production database is missing the required columns and tables that were added in recent migrations.

**Error from Vercel logs:**
```
Error [PrismaClientKnownRequestError]: Invalid `prisma.financialSettings.findFirst()` invocation: 
The column `FinancialSettings.adminStripeAccountId` does not exist in the current database.
```

## 🔍 Root Cause

The local database has the correct schema with all required columns, but the production database on Vercel hasn't been updated with the recent migrations:
- `20250826144222_add_admin_stripe_account_and_platform_fee_transfers`
- `20250826144444_add_platform_fee_transferred_to_orders`

## ✅ Solution Options

### Option 1: Run the Fix Script (Recommended)

1. **Deploy the fix script to Vercel:**
   ```bash
   # The script will be available at: scripts/fix-production-database.mjs
   ```

2. **Run the script on Vercel:**
   - Go to your Vercel dashboard
   - Navigate to your project
   - Go to Functions tab
   - Create a new function or use the existing API route
   - Run the script to apply the database changes

### Option 2: Manual SQL Execution

1. **Access your production database:**
   - Connect to your PostgreSQL database on Vercel
   - Use the database connection string from your environment variables

2. **Run the SQL script:**
   ```sql
   -- Copy and paste the contents of scripts/fix-production-database.sql
   ```

### Option 3: Vercel CLI Migration

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy migrations:**
   ```bash
   vercel env pull .env.production
   npx prisma migrate deploy
   ```

## 📋 Required Database Changes

### 1. FinancialSettings Table
Add these columns to the `FinancialSettings` table:
- `adminStripeAccountId` (TEXT, nullable)
- `adminStripeAccountStatus` (TEXT, default 'PENDING')
- `adminStripeAccountEmail` (TEXT, nullable)
- `adminStripeAccountName` (TEXT, nullable)
- `platformFeeBalance` (DOUBLE PRECISION, default 0)
- `lastPlatformFeePayout` (TIMESTAMP, nullable)

### 2. PlatformFeeTransfer Table
Create a new table for tracking platform fee transfers:
```sql
CREATE TABLE "PlatformFeeTransfer" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'nzd',
    "stripeTransferId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlatformFeeTransfer_pkey" PRIMARY KEY ("id")
);
```

### 3. Order Table
Add this column to the `Order` table:
- `platformFeeTransferred` (BOOLEAN, default false)

## 🔧 Implementation Steps

### Step 1: Create a Vercel Function

Create a new API route to run the database fix:

```typescript
// app/api/fix-database/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Add missing columns to FinancialSettings
    await prisma.$executeRaw`
      ALTER TABLE "FinancialSettings" 
      ADD COLUMN IF NOT EXISTS "adminStripeAccountEmail" TEXT,
      ADD COLUMN IF NOT EXISTS "adminStripeAccountId" TEXT,
      ADD COLUMN IF NOT EXISTS "adminStripeAccountName" TEXT,
      ADD COLUMN IF NOT EXISTS "adminStripeAccountStatus" TEXT NOT NULL DEFAULT 'PENDING',
      ADD COLUMN IF NOT EXISTS "lastPlatformFeePayout" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "platformFeeBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;
    `

    // Create PlatformFeeTransfer table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "PlatformFeeTransfer" (
        "id" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "currency" TEXT NOT NULL DEFAULT 'nzd',
        "stripeTransferId" TEXT,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "description" TEXT,
        "metadata" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "PlatformFeeTransfer_pkey" PRIMARY KEY ("id")
      );
    `

    // Add platformFeeTransferred to Order table
    await prisma.$executeRaw`
      ALTER TABLE "Order" 
      ADD COLUMN IF NOT EXISTS "platformFeeTransferred" BOOLEAN NOT NULL DEFAULT false;
    `

    return NextResponse.json({ 
      success: true, 
      message: 'Database schema updated successfully' 
    })
  } catch (error) {
    console.error('Database fix error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
```

### Step 2: Deploy and Run

1. **Deploy the changes:**
   ```bash
   git add .
   git commit -m "Add database fix for platform fees functionality"
   git push
   ```

2. **Run the fix:**
   ```bash
   curl -X POST https://your-vercel-app.vercel.app/api/fix-database
   ```

### Step 3: Verify the Fix

1. **Check the admin platform fees page**
2. **Verify no more "Failed to load platform fee data" errors**
3. **Test the platform fees functionality**

## 🧪 Testing

After applying the fix, test the following:

1. **Admin Dashboard → Platform Fees tab**
   - Should load without errors
   - Should show platform fee summary
   - Should allow admin account setup

2. **Platform Fee Calculations**
   - Check if platform fees are being calculated correctly
   - Verify transfer functionality works

3. **Database Verification**
   - Confirm all columns exist in FinancialSettings table
   - Confirm PlatformFeeTransfer table exists
   - Confirm Order table has platformFeeTransferred column

## 🚀 Alternative: Quick Fix via Vercel Dashboard

If you have direct database access:

1. **Go to Vercel Dashboard**
2. **Navigate to your project**
3. **Go to Storage → Database**
4. **Open the SQL editor**
5. **Run the SQL script from `scripts/fix-production-database.sql`**

## 📞 Support

If you encounter any issues:

1. **Check Vercel logs** for detailed error messages
2. **Verify database connection** is working
3. **Ensure you have proper permissions** to modify the database schema
4. **Test the changes** in a staging environment first

## ✅ Success Criteria

The fix is successful when:
- ✅ Admin platform fees page loads without errors
- ✅ No "Failed to load platform fee data" messages
- ✅ Platform fee calculations work correctly
- ✅ Admin can set up Stripe account for transfers
- ✅ All database columns and tables exist as expected
