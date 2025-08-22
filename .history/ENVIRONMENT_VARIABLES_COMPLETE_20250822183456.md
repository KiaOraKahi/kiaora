# 🌍 Environment Variables - Complete Guide

## 📋 **Current Local Environment Variables**

Based on your `.env` file, here are your current values:

### **✅ Already Configured (Local)**
```
DATABASE_URL="postgresql://postgres:1234@localhost:5432/kia_ora_db"
NODE_ENV="development"
NEXTAUTH_SECRET="your-super-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_51Rx60fIc04RmNsOB0pcwaF7l0CyL81h15Q39pUGb9G7buFtrSvj7H2DMW4XMeX0liXiiUTB9O3kEsdHQ0S7T4weY009024qMdP"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51Rx60fIc04RmNsOBUmmqq2DNNM65Ad18h4pKXdUhLdIVlEAnhU5gdhxXm7NZWakgcZl7De80lCaKNW4QrIlQKbKq00XV1fDcm5"
```

### **❌ Missing (Required for Production)**
```
GOOGLE_CLIENT_ID="[NOT SET]"
GOOGLE_CLIENT_SECRET="[NOT SET]"
BLOB_READ_WRITE_TOKEN="[NOT SET]"
EMAIL_USER="[NOT SET]"
EMAIL_PASS="[NOT SET]"
```

## 🚀 **Vercel Environment Variables Setup**

### **📊 Database Configuration**
```
Name: DATABASE_URL
Current Value: postgresql://postgres:1234@localhost:5432/kia_ora_db
Vercel Value: [Your production PostgreSQL URL]
Status: ⚠️ Need to change for production
```

### **🔐 NextAuth Configuration**
```
Name: NEXTAUTH_SECRET
Current Value: your-super-secret-key-here-change-in-production
Vercel Value: [Generate a secure random string]
Status: ⚠️ Need to change for production

Name: NEXTAUTH_URL
Current Value: http://localhost:3000
Vercel Value: https://your-app-name.vercel.app
Status: ⚠️ Need to change for production
```

### **💳 Stripe Configuration**
```
Name: STRIPE_SECRET_KEY
Current Value: sk_test_51Rx60fIc04RmNsOB0pcwaF7l0CyL81h15Q39pUGb9G7buFtrSvj7H2DMW4XMeX0liXiiUTB9O3kEsdHQ0S7T4weY009024qMdP
Vercel Value: [Keep same for test, change to live key for production]
Status: ✅ Can use same (test mode)

Name: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Current Value: pk_test_51Rx60fIc04RmNsOBUmmqq2DNNM65Ad18h4pKXdUhLdIVlEAnhU5gdhxXm7NZWakgcZl7De80lCaKNW4QrIlQKbKq00XV1fDcm5
Vercel Value: [Keep same for test, change to live key for production]
Status: ✅ Can use same (test mode)
```

### **🔗 Google OAuth (MISSING - REQUIRED)**
```
Name: GOOGLE_CLIENT_ID
Current Value: [NOT SET]
Vercel Value: [Your Google OAuth Client ID]
Status: ❌ MUST SET UP

Name: GOOGLE_CLIENT_SECRET
Current Value: [NOT SET]
Vercel Value: [Your Google OAuth Client Secret]
Status: ❌ MUST SET UP
```

### **📁 File Upload (MISSING - REQUIRED)**
```
Name: BLOB_READ_WRITE_TOKEN
Current Value: [NOT SET]
Vercel Value: [Your Vercel Blob storage token]
Status: ❌ MUST SET UP
```

### **📧 Email Configuration (MISSING - RECOMMENDED)**
```
Name: EMAIL_USER
Current Value: [NOT SET]
Vercel Value: [Your email address]
Status: ⚠️ RECOMMENDED

Name: EMAIL_PASS
Current Value: [NOT SET]
Vercel Value: [Your email password or app password]
Status: ⚠️ RECOMMENDED
```

### **🌍 Node Environment**
```
Name: NODE_ENV
Current Value: development
Vercel Value: production
Status: ⚠️ Need to change for production
```

## 📋 **Complete Vercel Environment Variables List**

Copy these exact names and values to your Vercel dashboard:

| **Name** | **Current Value** | **Vercel Value** | **Status** |
|----------|-------------------|------------------|------------|
| `DATABASE_URL` | `postgresql://postgres:1234@localhost:5432/kia_ora_db` | `[Production PostgreSQL URL]` | ⚠️ Change |
| `NEXTAUTH_SECRET` | `your-super-secret-key-here-change-in-production` | `[Generate secure string]` | ⚠️ Change |
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://your-app-name.vercel.app` | ⚠️ Change |
| `STRIPE_SECRET_KEY` | `sk_test_51Rx60fIc04RmNsOB0pcwaF7l0CyL81h15Q39pUGb9G7buFtrSvj7H2DMW4XMeX0liXiiUTB9O3kEsdHQ0S7T4weY009024qMdP` | `[Same or live key]` | ✅ Keep |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_[your-stripe-publishable-key]` | `[Same or live key]` | ✅ Keep |
| `GOOGLE_CLIENT_ID` | `[NOT SET]` | `[Your Google OAuth Client ID]` | ❌ MUST SET |
| `GOOGLE_CLIENT_SECRET` | `[NOT SET]` | `[Your Google OAuth Client Secret]` | ❌ MUST SET |
| `BLOB_READ_WRITE_TOKEN` | `[NOT SET]` | `[Your Vercel Blob token]` | ❌ MUST SET |
| `EMAIL_USER` | `[NOT SET]` | `[Your email address]` | ⚠️ RECOMMENDED |
| `EMAIL_PASS` | `[NOT SET]` | `[Your email password]` | ⚠️ RECOMMENDED |
| `NODE_ENV` | `development` | `production` | ⚠️ Change |

## 🚨 **Critical Missing Variables**

You **MUST** set up these before deploying:

1. **Google OAuth** - Required for user authentication
2. **Vercel Blob** - Required for file uploads (profile images, videos)
3. **Production Database** - Required for data storage
4. **Secure NEXTAUTH_SECRET** - Required for security

## 🔧 **How to Get Missing Values**

### **Google OAuth Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `https://your-app-name.vercel.app/api/auth/callback/google`

### **Vercel Blob Setup:**
1. In Vercel dashboard, go to Storage
2. Create a new Blob store
3. Copy the read/write token

### **Production Database:**
1. Use Vercel Postgres (recommended)
2. Or set up external PostgreSQL (Supabase, Railway, etc.)

### **Secure NEXTAUTH_SECRET:**
Generate a secure random string:
```bash
openssl rand -base64 32
```

## ✅ **Ready-to-Copy Values for Vercel**

Here are the exact values you can copy to Vercel (replace placeholders with your actual values):

```
DATABASE_URL=[Your production PostgreSQL URL]
NEXTAUTH_SECRET=[Generate secure random string]
NEXTAUTH_URL=https://your-app-name.vercel.app
STRIPE_SECRET_KEY=sk_test_[your-stripe-secret-key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_[your-stripe-publishable-key]
GOOGLE_CLIENT_ID=[Your Google OAuth Client ID]
GOOGLE_CLIENT_SECRET=[Your Google OAuth Client Secret]
BLOB_READ_WRITE_TOKEN=[Your Vercel Blob token]
EMAIL_USER=[Your email address]
EMAIL_PASS=[Your email password]
NODE_ENV=production
```

## 🔒 **Security Note**

⚠️ **Never commit actual API keys or secrets to Git!**
- Use environment variables for all sensitive data
- Keep your `.env` file in `.gitignore`
- Use placeholder values in documentation
