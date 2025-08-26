# Project Cleanup Plan

## Overview
This document outlines the cleanup of unwanted files from the Kia Ora project after the authentication system simplification.

## Files to Remove

### 🗑️ **Development/Test Files**

#### 1. **Stripe CLI Binary**
- `stripe_1.29.0_windows_x86_64/` - 30MB Stripe CLI binary (not needed in production)

#### 2. **Build Artifacts**
- `tsconfig.tsbuildinfo` - TypeScript build cache (1.5MB)
- `.next/` - Next.js build cache (can be regenerated)

#### 3. **History Files**
- `.history/` - VS Code history files (multiple MB of duplicate files)

### 🗑️ **Test/Demo Data**

#### 4. **Uploaded Test Files**
- `public/uploads/celebrity-applications/` - Test ID documents and photos (multiple MB)

#### 5. **Test Scripts**
- `scripts/check-sarah-status.js` - Specific test script
- `scripts/manual-transfer-sarah.js` - Specific test script
- `scripts/test-*.mjs` - Various test scripts
- `scripts/create-*.mjs` - Test data creation scripts
- `scripts/verify-*.mjs` - Verification test scripts
- `scripts/clean-demo-data.mjs` - Demo data cleanup
- `scripts/add-sample-data.mjs` - Sample data creation
- `scripts/seed-services.js` - Service seeding

#### 6. **Development Scripts**
- `scripts/setup-*.mjs` - Setup scripts (already used)
- `scripts/migrate-*.mjs` - Migration scripts (already used)
- `scripts/reset-postgres-password.mjs` - Database reset script

### 🗑️ **Outdated Documentation**

#### 7. **Old Documentation**
- `AUTH_SYSTEM_GUIDE.md` - Outdated after auth simplification
- `DEPLOYMENT_CHECKLIST.md` - May be outdated
- `VERCEL_DEPLOYMENT_GUIDE.md` - May be outdated
- `PROFILE_IMAGE_UPLOAD_GUIDE.md` - May be outdated
- `HELP_CONTACT_GUIDE.md` - May be outdated
- `PRODUCTION_READY_SUMMARY.md` - May be outdated
- `IMPLEMENTATION_GUIDE.md` - May be outdated

### 🗑️ **Unused Assets**

#### 8. **Demo Images**
- `public/celeb1.jpg` - Demo celebrity image (4.5MB)
- `public/celeb2.jpg` - Demo celebrity image (1.3MB)
- `public/celeb3.jpg` - Demo celebrity image (1.2MB)

## Files to Keep

### ✅ **Essential Files**
- `package.json` & `package-lock.json` - Dependencies
- `tsconfig.json` - TypeScript config
- `next.config.ts` - Next.js config
- `postcss.config.mjs` - PostCSS config
- `components.json` - UI components config
- `README.md` - Project documentation
- `AUTHENTICATION_SIMPLIFICATION_SUMMARY.md` - Recent changes
- `ENVIRONMENT_VARIABLES_COMPLETE.md` - Updated env guide

### ✅ **Source Code**
- `app/` - Application code
- `components/` - React components
- `lib/` - Utility libraries
- `types/` - TypeScript types
- `prisma/` - Database schema and migrations

### ✅ **Public Assets**
- `public/talents/` - Talent images
- `public/next.svg`, `public/vercel.svg` - Framework logos
- `public/file.svg`, `public/globe.svg`, `public/window.svg` - UI icons

## Cleanup Commands

```bash
# Remove Stripe CLI binary
rm -rf stripe_1.29.0_windows_x86_64/

# Remove build artifacts
rm -f tsconfig.tsbuildinfo
rm -rf .next/

# Remove history files
rm -rf .history/

# Remove test uploads
rm -rf public/uploads/celebrity-applications/

# Remove demo images
rm -f public/celeb1.jpg public/celeb2.jpg public/celeb3.jpg

# Remove test scripts
rm -f scripts/check-sarah-status.js
rm -f scripts/manual-transfer-sarah.js
rm -f scripts/test-*.mjs
rm -f scripts/create-*.mjs
rm -f scripts/verify-*.mjs
rm -f scripts/clean-demo-data.mjs
rm -f scripts/add-sample-data.mjs
rm -f scripts/seed-services.js

# Remove development scripts
rm -f scripts/setup-*.mjs
rm -f scripts/migrate-*.mjs
rm -f scripts/reset-postgres-password.mjs

# Remove outdated documentation
rm -f AUTH_SYSTEM_GUIDE.md
rm -f DEPLOYMENT_CHECKLIST.md
rm -f VERCEL_DEPLOYMENT_GUIDE.md
rm -f PROFILE_IMAGE_UPLOAD_GUIDE.md
rm -f HELP_CONTACT_GUIDE.md
rm -f PRODUCTION_READY_SUMMARY.md
rm -f IMPLEMENTATION_GUIDE.md
```

## Expected Results

### 📊 **Size Reduction**
- **Before**: ~50MB+ (estimated)
- **After**: ~10MB (estimated)
- **Reduction**: ~80% smaller

### 🎯 **Benefits**
1. **Faster Git operations** - Smaller repository
2. **Cleaner codebase** - No test/demo files
3. **Easier deployment** - No unnecessary files
4. **Better organization** - Only production-ready code
5. **Reduced confusion** - No outdated documentation

## Verification Steps

After cleanup:
1. ✅ Verify application still builds: `npm run build`
2. ✅ Verify application still runs: `npm run dev`
3. ✅ Verify database migrations work: `npx prisma migrate dev`
4. ✅ Verify all tests pass (if any)
5. ✅ Verify deployment works correctly

## Backup Strategy

Before cleanup:
1. Create a backup branch: `git checkout -b backup-before-cleanup`
2. Commit current state: `git add . && git commit -m "Backup before cleanup"`
3. Push backup branch: `git push origin backup-before-cleanup`

This ensures we can recover any accidentally removed files if needed.
