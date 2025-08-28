# 🚀 Hoopla Hosting Environment Variables

## 📋 **Required Environment Variables for Hoopla Hosting**

Set these environment variables in your Hoopla Hosting cPanel:

### **🗄️ Database Configuration**
```
DATABASE_URL=postgres://f6b3594d231a10194416a318a056ea2946f16e73c093bca313bf296cc00343bf:sk_qcpY8_xIfgKD2qhKfZBra@db.prisma.io:5432/postgres?sslmode=require
```

**Alternative (Prisma Accelerate - Better Performance):**
```
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19xY3BZOF94SWZnS0QycWhLZlpCcmEiLCJhcGlfa2V5IjoiMDFLM1FYRTBDRDcySFQ0UEEwS1BaQjIyMlAiLCJ0ZW5hbnRfaWQiOiJmNmIzNTk0ZDIzMWExMDE5NDQxNmEzMThhMDU2ZWEyOTQ2ZjE2ZTczYzA5M2JjYTMxM2JmMjk2Y2MwMDM0M2JmIiwiaW50ZXJuYWxfc2VjcmV0IjoiYjAwNzMwMzktMGE1Ny00OTQ0LTg4YTAtN2Q5M2MwZWU1YmMwIn0._lZgz0FbY67gws_6WkXgTycRuHvXZmZXJ-BVBdYxa0U
```

### **🔐 Authentication**
```
NEXTAUTH_SECRET=your-super-secret-key-here-change-in-production
NEXTAUTH_URL=https://kiaorakahi.com
```

### **💳 Stripe Configuration**
```
STRIPE_SECRET_KEY=sk_test_51Rx60fIc04RmNsOB0pcwaF7l0CyL81h15Q39pUGb9G7buFtrSvj7H2DMW4XMeX0liXiiUTB9O3kEsdHQ0S7T4weY009024qMdP
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Rx60fIc04RmNsOBUmmqq2DNNM65Ad18h4pKXdUhLdIVlEAnhU5gdhxXm7NZWakgcZl7De80lCaKNW4QrIlQKbKq00XV1fDcm5
```

### **📧 Email Configuration (Optional but Recommended)**
```
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password-or-app-password
```

### **🌍 Environment**
```
NODE_ENV=production
```

## 🔧 **How to Set Environment Variables in Hoopla Hosting**

1. **Log into cPanel**
2. **Go to "Software" → "Setup Node.js App"**
3. **Find your application**
4. **Click "Environment Variables"**
5. **Add each variable above**

## 🚨 **Important Notes**

- **Database**: You're using Prisma's hosted PostgreSQL database
- **Domain**: Make sure `kiaorakahi.com` points to Hoopla Hosting (not Wix)
- **SSL**: Ensure SSL certificate is properly configured
- **Node.js Version**: Make sure you're using Node.js 18+ in Hoopla Hosting

## ✅ **Verification Steps**

After setting environment variables:

1. **Check database connection** - Your app should connect to Prisma database
2. **Test authentication** - Sign up/login should work
3. **Test Stripe payments** - Payment flow should work
4. **Check email functionality** - If configured

## 🔒 **Security Reminders**

- Generate a secure `NEXTAUTH_SECRET` using: `openssl rand -base64 32`
- Never commit actual secrets to Git
- Use environment variables for all sensitive data
