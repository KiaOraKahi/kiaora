# 🚀 Vercel Deployment Checklist

## Current Status Analysis ✅

Based on the migration analysis, here's your current state:

### ✅ What's Ready
- **Database**: PostgreSQL connected and working
- **Users**: 13 users in database
- **Celebrities**: 4 celebrity profiles
- **Orders**: 3 orders
- **Core Environment Variables**: DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, Stripe keys

### ❌ What Needs Setup
- **Google OAuth**: Not configured
- **Vercel Blob**: Not configured (needed for file uploads)
- **Stripe Webhook**: Not configured

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Setup

#### Required for Production:
- [ ] `GOOGLE_CLIENT_ID` - Set up Google OAuth
- [ ] `GOOGLE_CLIENT_SECRET` - Set up Google OAuth
- [ ] `BLOB_READ_WRITE_TOKEN` - Set up Vercel Blob
- [ ] `STRIPE_WEBHOOK_SECRET` - Set up Stripe webhooks

#### Already Configured:
- [x] `DATABASE_URL` - PostgreSQL connection
- [x] `NEXTAUTH_URL` - Authentication URL
- [x] `NEXTAUTH_SECRET` - Auth secret
- [x] `STRIPE_SECRET_KEY` - Stripe secret
- [x] `STRIPE_PUBLISHABLE_KEY` - Stripe public key

### 2. Database Migration

#### Current Data:
- **13 Users** (mix of FAN, CELEBRITY, ADMIN roles)
- **4 Celebrities** with profiles
- **3 Orders** in system
- **0 Applications** (clean slate)

#### Migration Steps:
1. [ ] Set up Vercel Postgres database
2. [ ] Export current data: `pg_dump kia_ora_db > backup.sql`
3. [ ] Import to production: `psql production_db < backup.sql`
4. [ ] Run schema migration: `npx prisma db push`

### 3. Service Setup

#### Google OAuth Setup:
1. [ ] Go to [Google Cloud Console](https://console.cloud.google.com)
2. [ ] Create new project or use existing
3. [ ] Enable Google+ API
4. [ ] Create OAuth 2.0 credentials
5. [ ] Add authorized redirect URIs:
   - `https://your-domain.vercel.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for development)

#### Vercel Blob Setup:
1. [ ] In Vercel dashboard, go to Storage
2. [ ] Create new Blob store
3. [ ] Copy the `BLOB_READ_WRITE_TOKEN`
4. [ ] Add to environment variables

#### Stripe Webhook Setup:
1. [ ] Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. [ ] Navigate to Developers → Webhooks
3. [ ] Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
4. [ ] Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. [ ] Copy webhook secret and add as `STRIPE_WEBHOOK_SECRET`

### 4. Vercel Deployment

#### Project Setup:
1. [ ] Connect GitHub repository to Vercel
2. [ ] Configure build settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

#### Environment Variables:
1. [ ] Add all environment variables in Vercel dashboard
2. [ ] Set for Production, Preview, and Development environments
3. [ ] Verify all secrets are properly encrypted

#### Domain Setup:
1. [ ] Configure custom domain (if applicable)
2. [ ] Update `NEXTAUTH_URL` to match production domain
3. [ ] Update Google OAuth redirect URIs
4. [ ] Update Stripe webhook endpoint

### 5. Post-Deployment Testing

#### Core Functionality:
- [ ] User registration and login
- [ ] Profile image upload (FAN role only)
- [ ] Celebrity profile management
- [ ] Order creation and management
- [ ] Payment processing
- [ ] File uploads (Vercel Blob)

#### Security Testing:
- [ ] Role-based access control
- [ ] API endpoint security
- [ ] File upload validation
- [ ] Payment security

#### Performance Testing:
- [ ] Database query performance
- [ ] Image loading and optimization
- [ ] API response times
- [ ] File upload speeds

### 6. Monitoring Setup

#### Analytics:
- [ ] Enable Vercel Analytics
- [ ] Set up Google Analytics (if needed)
- [ ] Configure error tracking (Sentry, LogRocket)

#### Database Monitoring:
- [ ] Set up database performance alerts
- [ ] Monitor connection pool usage
- [ ] Track slow queries

#### Application Monitoring:
- [ ] Set up uptime monitoring
- [ ] Configure error alerts
- [ ] Monitor API usage

## 🚨 Critical Issues to Address

### 1. Missing Google OAuth
**Impact**: Users can't sign in with Google
**Priority**: HIGH
**Solution**: Set up Google Cloud Console credentials

### 2. Missing Vercel Blob
**Impact**: Profile image uploads won't work
**Priority**: HIGH
**Solution**: Create Vercel Blob store

### 3. Missing Stripe Webhook
**Impact**: Payment confirmations won't work
**Priority**: HIGH
**Solution**: Configure Stripe webhook endpoint

## 📊 Estimated Costs

### Monthly Costs (Production):
- **Vercel Pro**: $20/month
- **Vercel Postgres**: $20/month
- **Vercel Blob**: ~$5-10/month (depending on usage)
- **Stripe**: 2.9% + 30¢ per transaction
- **Email Service**: $20/month (Resend)

**Total**: ~$65-70/month + transaction fees

## 🎯 Deployment Timeline

### Phase 1: Setup (1-2 days)
- [ ] Configure Google OAuth
- [ ] Set up Vercel Blob
- [ ] Configure Stripe webhooks
- [ ] Set up Vercel Postgres

### Phase 2: Deployment (1 day)
- [ ] Deploy to Vercel
- [ ] Migrate database
- [ ] Test core functionality

### Phase 3: Testing (1-2 days)
- [ ] Comprehensive testing
- [ ] Security audit
- [ ] Performance optimization

### Phase 4: Launch (1 day)
- [ ] Final testing
- [ ] Domain configuration
- [ ] Go live

## 🆘 Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Prisma Documentation**: https://www.prisma.io/docs
- **NextAuth Documentation**: https://next-auth.js.org
- **Stripe Documentation**: https://stripe.com/docs

---

**Ready to deploy?** Follow this checklist step by step, and you'll have a production-ready Kia Ora application!
