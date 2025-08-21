# Kia Ora Authentication System Guide

## Overview

The Kia Ora authentication system provides a complete user authentication solution with signup, login, password reset, and email verification functionality. The system is built with security best practices and modern UX patterns.

## Features

### ✅ **Core Authentication Features**
- **User Registration** - Sign up with email verification
- **User Login** - Secure credential-based authentication
- **Password Reset** - Email-based password recovery
- **Email Verification** - Account activation via email
- **Auto-login** - Seamless login after email verification
- **Role-based Access** - Support for FAN, CELEBRITY, and ADMIN roles

### 🔒 **Security Features**
- **Password Hashing** - bcrypt with salt rounds
- **JWT Tokens** - Secure session management
- **Email Verification** - Prevents fake accounts
- **Password Strength Validation** - Enforces strong passwords
- **Rate Limiting** - Prevents brute force attacks
- **CSRF Protection** - Built-in Next.js protection

### 🎨 **User Experience**
- **Modern UI** - Gradient designs with dark theme
- **Real-time Validation** - Instant form feedback
- **Password Strength Indicator** - Visual password strength
- **Loading States** - Smooth user feedback
- **Error Handling** - Clear error messages
- **Responsive Design** - Works on all devices

## File Structure

```
app/
├── api/auth/
│   ├── signup/route.ts              # User registration
│   ├── forgot-password/route.ts     # Password reset request
│   ├── reset-password/route.ts      # Password reset execution
│   ├── verify-email/route.ts        # Email verification
│   └── auto-login/route.ts          # Auto-login after verification
├── auth/
│   ├── signup/page.tsx              # Registration page
│   ├── signin/page.tsx              # Login page
│   ├── forgot-password/page.tsx     # Password reset request page
│   ├── reset-password/page.tsx      # Password reset page
│   └── verify-email/page.tsx        # Email verification page
components/
└── auth/
    └── auth-modal.tsx               # Modal for quick auth actions
lib/
├── validations/auth.ts              # Form validation schemas
└── email.ts                         # Email sending functionality
```

## API Endpoints

### POST `/api/auth/signup`
Creates a new user account and sends verification email.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "FAN"
}
```

**Response:**
```json
{
  "message": "Account created successfully! Check your email to verify your account."
}
```

### POST `/api/auth/forgot-password`
Sends password reset email to user.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "If an account with that email exists, we've sent a password reset link."
}
```

### POST `/api/auth/reset-password`
Resets user password using token.

**Request Body:**
```json
{
  "token": "reset_token_here",
  "password": "NewSecurePass123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

### GET `/api/auth/verify-email?token=verification_token`
Verifies user email and returns login token.

**Response:**
```json
{
  "message": "Email verified successfully",
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "FAN"
  },
  "loginToken": "jwt_token_for_auto_login"
}
```

## Password Requirements

The system enforces strong password requirements:

- **Minimum Length**: 8 characters
- **Maximum Length**: 128 characters
- **Must Contain**:
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one number (0-9)
- **Recommended**: Special characters for extra security

## Email Templates

The system includes professionally designed email templates for:

1. **Account Verification** - Welcome email with verification link
2. **Password Reset** - Secure password reset link
3. **Application Status** - Celebrity application updates
4. **Booking Notifications** - Order status updates
5. **Video Delivery** - Video completion notifications

## User Roles

### FAN
- Default role for new registrations
- Can book celebrity videos
- Access to fan dashboard

### CELEBRITY
- Can receive booking requests
- Access to celebrity dashboard
- Video upload capabilities

### ADMIN
- Full system access
- User management
- Content moderation

## Security Best Practices

### ✅ **Implemented**
- Password hashing with bcrypt
- Email verification for new accounts
- JWT token expiration
- Input validation and sanitization
- CSRF protection
- Secure password requirements

### 🔄 **Recommended Additions**
- Rate limiting for auth endpoints
- Two-factor authentication (2FA)
- Account lockout after failed attempts
- Session management
- Audit logging

## Environment Variables

Required environment variables for authentication:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Database
DATABASE_URL=your-database-url
```

## Testing

### Test Accounts
The system includes test accounts for development:

- **Celebrity**: `emma.stone@example.com` / `celebrity123`
- **Admin**: `admin@example.com` / `admin123`
- **Fan**: `john.doe@example.com` / `fan123`

### Manual Testing Checklist

- [ ] User registration with email verification
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Password reset flow
- [ ] Email verification flow
- [ ] Auto-login after verification
- [ ] Role-based redirects
- [ ] Form validation
- [ ] Password strength indicator
- [ ] Responsive design

## Troubleshooting

### Common Issues

1. **Email Not Sending**
   - Check EMAIL_USER and EMAIL_PASS environment variables
   - Verify Gmail app password setup
   - Check spam folder

2. **Verification Link Expired**
   - Links expire after 24 hours
   - Request new verification email

3. **Password Reset Not Working**
   - Check token expiration (1 hour)
   - Verify email address exists

4. **Auto-login Issues**
   - Check NEXTAUTH_SECRET environment variable
   - Verify JWT token expiration

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=true
```

## Future Enhancements

### Planned Features
- [ ] Google OAuth integration
- [ ] Two-factor authentication
- [ ] Social login (Facebook, Twitter)
- [ ] Account deletion
- [ ] Profile management
- [ ] Session management
- [ ] Audit logging

### Performance Optimizations
- [ ] Email queue system
- [ ] Caching for user sessions
- [ ] Database query optimization
- [ ] CDN for static assets

## Support

For authentication system support:
- **Email**: support@kiaora.com
- **Documentation**: This guide
- **Issues**: GitHub repository

---

*Last updated: January 2025*
