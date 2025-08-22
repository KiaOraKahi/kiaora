# Vercel Deployment Guide for Kia Ora

## Overview

This guide covers deploying your Kia Ora application to Vercel, including database migration, environment setup, and production considerations.

## 🗄️ Database Migration Strategy

### Option 1: Vercel Postgres (Recommended)

**Pros:**
- Native Vercel integration
- Automatic connection pooling
- Built-in backups
- Easy scaling

**Setup:**
1. In Vercel dashboard, go to your project
2. Navigate to Storage → Create Database
3. Choose PostgreSQL
4. Vercel will automatically set `DATABASE_URL` environment variable

### Option 2: Supabase (Alternative)

**Pros:**
- Real-time features
- Built-in auth (though you're using NextAuth)
- Generous free tier
- Great developer experience

**Setup:**
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Set as `DATABASE_URL` in Vercel

### Option 3: Neon (Serverless PostgreSQL)

**Pros:**
- Serverless (pay per use)
- Branching for development
- Auto-scaling

## 🔧 Environment Variables Setup

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth (if using)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Vercel Blob (for file uploads)
BLOB_READ_WRITE_TOKEN="your-blob-token"

# Stripe (for payments)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (for notifications)
RESEND_API_KEY="your-resend-key"
```

### Setting Environment Variables in Vercel

1. Go to your project in Vercel dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable for Production, Preview, and Development environments

## 🚀 Deployment Steps

### 1. Prepare Your Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings

### 3. Build Configuration

Your `next.config.ts` should work as-is, but ensure:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    domains: [
      'blob.vercel-storage.com',
      'lh3.googleusercontent.com', // For Google OAuth avatars
    ],
  },
}

module.exports = nextConfig
```

### 4. Database Migration

After setting up your database:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# Or if using migrations
npx prisma migrate deploy
```

## 📊 Data Migration

### Current Data Backup

Before migrating, backup your current data:

```bash
# Export current data (if using local database)
pg_dump your_local_db > backup.sql

# Or use Prisma to export
npx prisma db pull
```

### Data Import

After setting up production database:

```bash
# Import data
psql your_production_db < backup.sql

# Or use Prisma to seed data
npx prisma db seed
```

## 🔐 Security Considerations

### 1. Environment Variables
- Never commit `.env` files
- Use Vercel's environment variable system
- Rotate secrets regularly

### 2. Database Security
- Use connection pooling
- Enable SSL connections
- Restrict database access

### 3. File Upload Security
- Validate file types server-side
- Set appropriate CORS headers
- Use signed URLs for sensitive uploads

## 🧪 Testing Before Production

### 1. Preview Deployments
Vercel automatically creates preview deployments for pull requests. Test these thoroughly.

### 2. Database Testing
```bash
# Test database connection
npx prisma db pull

# Test migrations
npx prisma migrate dev --name test-migration
```

### 3. API Testing
Test all your API endpoints:
- Profile image upload
- User authentication
- Payment processing
- File uploads

## 📈 Performance Optimization

### 1. Database Optimization
```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_celebrity_user_id ON "Celebrity"(userId);
CREATE INDEX idx_order_user_id ON "Order"(userId);
```

### 2. Image Optimization
- Use Next.js Image component
- Implement proper caching headers
- Consider CDN for static assets

### 3. API Optimization
- Implement proper caching
- Use connection pooling
- Optimize database queries

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🚨 Monitoring & Alerts

### 1. Vercel Analytics
- Enable Vercel Analytics for performance monitoring
- Set up error tracking

### 2. Database Monitoring
- Monitor database performance
- Set up alerts for high usage
- Track slow queries

### 3. Application Monitoring
- Set up error logging (Sentry, LogRocket)
- Monitor API response times
- Track user experience metrics

## 🔧 Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database connected and migrated
- [ ] File uploads working
- [ ] Authentication working
- [ ] Payment processing tested
- [ ] Email notifications working
- [ ] SSL certificate active
- [ ] Domain configured
- [ ] Analytics tracking
- [ ] Error monitoring active

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check `DATABASE_URL` format
   - Verify SSL settings
   - Check firewall rules

2. **File Upload Issues**
   - Verify `BLOB_READ_WRITE_TOKEN`
   - Check CORS settings
   - Validate file size limits

3. **Authentication Problems**
   - Verify `NEXTAUTH_URL` matches domain
   - Check OAuth callback URLs
   - Ensure `NEXTAUTH_SECRET` is set

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

## 📞 Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

## 💰 Cost Considerations

### Vercel Pricing
- **Hobby**: Free (limited)
- **Pro**: $20/month
- **Enterprise**: Custom pricing

### Database Pricing
- **Vercel Postgres**: $20/month (starter)
- **Supabase**: Free tier available
- **Neon**: Pay per use

### Additional Services
- **Vercel Blob**: $0.10/GB
- **Email (Resend)**: $20/month (50k emails)
- **Monitoring**: Varies by service

## 🎯 Next Steps

1. **Choose Database Provider**: Vercel Postgres recommended
2. **Set Up Environment Variables**: Configure all required secrets
3. **Test Deployment**: Use preview deployments
4. **Migrate Data**: Backup and restore your data
5. **Monitor Performance**: Set up analytics and monitoring
6. **Scale as Needed**: Upgrade plans based on usage

---

**Need Help?** Create an issue in your repository or reach out to the Vercel support team.
