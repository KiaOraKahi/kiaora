# Profile Image Upload - Role-Based Access Control

## Overview

This feature implements role-based access control for profile image uploads, allowing only users with the **FAN** role to upload profile images.

## Implementation Details

### API Endpoint
- **Route**: `/api/user/profile-image`
- **Method**: `POST`
- **Authentication**: Required (NextAuth session)
- **Role Restriction**: FAN role only

### Frontend Component
- **Component**: `ProfileImageUpload`
- **Location**: `components/profile-image-upload.tsx`
- **Usage**: Integrated into the user dashboard profile settings

## Features

### ✅ Role-Based Access Control
- Only users with `FAN` role can upload profile images
- `CELEBRITY` and `ADMIN` users see a disabled button with explanation
- Clear error messages for unauthorized access

### ✅ File Validation
- **Allowed formats**: JPEG, JPG, PNG, WebP
- **Size limit**: 5MB maximum
- **Client-side validation**: Immediate feedback
- **Server-side validation**: Secure enforcement

### ✅ User Experience
- Real-time upload progress indicator
- Success/error toast notifications
- Automatic session refresh after upload
- Remove image functionality

### ✅ Security
- Server-side role validation
- File type and size validation
- Secure file storage via Vercel Blob
- Unique filename generation

## Database Schema

The profile images are stored in the `User` model:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  image         String?   // Profile image URL
  role          Role      @default(FAN)
  // ... other fields
}
```

## File Storage

- **Storage**: Vercel Blob
- **Path**: `profile-images/{userId}-{timestamp}-{filename}`
- **Access**: Public
- **Organization**: User-specific folders

## Usage Examples

### For FAN Users
```tsx
<ProfileImageUpload
  currentImage={userProfile.avatar}
  onImageUpdate={(imageUrl) => setUserProfile({ ...userProfile, avatar: imageUrl })}
  disabled={false}
/>
```

### For Non-FAN Users
The component automatically shows a disabled state with explanation:
- Button shows "Change Photo (FAN only)"
- Red text explains the restriction
- Button is disabled and grayed out

## API Response Examples

### Success Response
```json
{
  "message": "Profile image uploaded successfully",
  "filename": "profile-images/user123-1234567890-image.jpg",
  "url": "https://blob.vercel-storage.com/profile-images/user123-1234567890-image.jpg",
  "size": 1024000
}
```

### Error Responses

#### Unauthorized (Non-FAN role)
```json
{
  "error": "Only users with FAN role can upload profile images"
}
```

#### Invalid file type
```json
{
  "error": "Invalid file type. Only images (JPEG, PNG, WebP) are allowed for profile pictures."
}
```

#### File too large
```json
{
  "error": "File size too large. Maximum 5MB allowed."
}
```

## Testing

Run the test script to verify the implementation:

```bash
node scripts/test-profile-image-upload.mjs
```

This will:
- Check for users of each role type
- Verify role distribution
- Confirm API endpoint availability
- Validate component functionality

## Security Considerations

1. **Role Validation**: Server-side validation prevents bypassing frontend restrictions
2. **File Validation**: Both client and server validate file types and sizes
3. **Authentication**: All requests require valid NextAuth session
4. **File Storage**: Secure blob storage with unique filenames
5. **Database Updates**: Direct database updates ensure consistency

## Future Enhancements

- Image compression and optimization
- Multiple image formats support
- Image cropping functionality
- CDN integration for faster loading
- Image moderation/approval workflow
