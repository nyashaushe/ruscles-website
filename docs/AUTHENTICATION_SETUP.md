# Authentication Setup Guide

This guide covers setting up both Google OAuth and email/password authentication for admin users.

## Overview

The application supports two authentication methods:
- **Google OAuth**: Standard OAuth flow with Google
- **Email/Password**: Direct credential authentication for admin users

Both methods use the same admin email allowlist and create compatible sessions.

## Environment Variables

### Required Variables

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# Admin Access Control
ALLOWED_ADMIN_EMAILS=admin@example.com,admin2@example.com
```

### Optional Variables (Recommended)

```bash
# Google OAuth (provides fallback authentication)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Configuration Steps

### 1. Set Up Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

### 2. Configure NextAuth Secret

Generate a secure secret (minimum 32 characters):

```bash
# Option 1: Use openssl
openssl rand -base64 32

# Option 2: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Configure Admin Emails

Add comma-separated list of admin email addresses:

```bash
ALLOWED_ADMIN_EMAILS=admin@yourcompany.com,manager@yourcompany.com
```

**Important**: Only these emails can access the admin panel with either authentication method.

### 4. Set NextAuth URL

For development:
```bash
NEXTAUTH_URL=http://localhost:3000
```

For production:
```bash
NEXTAUTH_URL=https://yourdomain.com
```

### 5. (Optional) Configure Google OAuth

If you want Google OAuth as a fallback:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`

## Validation

### Automatic Validation

Run the validation script to check your configuration:

```bash
npm run auth:validate
```

This will check:
- ✅ Required environment variables
- ✅ Email format validation
- ✅ NextAuth configuration
- ✅ Security best practices

### Manual Validation

You can also validate during development by checking the production environment:

```javascript
import { checkProductionEnvironment } from '@/lib/production-check'

const isValid = checkProductionEnvironment()
console.log('Configuration valid:', isValid)
```

## Authentication Methods

### Email/Password Authentication

Users can sign in with:
- Email address (must be in `ALLOWED_ADMIN_EMAILS`)
- Password (minimum 6 characters for demo purposes)

**Note**: In production, integrate with your actual authentication provider (Firebase, Auth0, etc.)

### Google OAuth Authentication

Standard OAuth flow with Google accounts. The email must still be in the `ALLOWED_ADMIN_EMAILS` list.

## Security Considerations

### Production Checklist

- [ ] `NEXTAUTH_SECRET` is at least 32 characters and unique
- [ ] `NEXTAUTH_URL` uses HTTPS in production
- [ ] `ALLOWED_ADMIN_EMAILS` contains only authorized users
- [ ] Email addresses in allowlist are verified and active
- [ ] Google OAuth credentials are properly secured
- [ ] Environment variables are not committed to version control

### Best Practices

1. **Rotate Secrets**: Regularly update `NEXTAUTH_SECRET`
2. **Limit Admin Access**: Keep `ALLOWED_ADMIN_EMAILS` minimal
3. **Monitor Access**: Log authentication attempts
4. **Use HTTPS**: Always use HTTPS in production
5. **Backup Authentication**: Configure both OAuth and credentials for redundancy

## Troubleshooting

### Common Issues

**"Missing required environment variables"**
- Run `npm run auth:validate` to see what's missing
- Check `.env.local` file exists and has correct variables

**"Invalid email format in ALLOWED_ADMIN_EMAILS"**
- Ensure emails are properly formatted
- Check for extra spaces or invalid characters
- Use comma separation without spaces: `email1@domain.com,email2@domain.com`

**"NEXTAUTH_SECRET should be at least 32 characters"**
- Generate a new secret using the commands above
- Ensure no trailing spaces or newlines

**"Authentication failed"**
- Verify email is in `ALLOWED_ADMIN_EMAILS`
- Check password meets minimum requirements
- Ensure Google OAuth credentials are correct (if using)

### Debug Mode

Enable debug logging by setting:

```bash
NEXTAUTH_DEBUG=true
```

This will provide detailed logs for authentication flows.

## Integration with Existing Code

The authentication system integrates seamlessly with existing:
- ✅ NextAuth configuration
- ✅ Session middleware
- ✅ Admin route protection
- ✅ JWT token handling

No changes needed to existing authentication logic.

## Testing

### Unit Tests

Test authentication configuration:

```bash
npm run test test/auth
```

### Manual Testing

1. Start development server: `npm run dev`
2. Visit `/auth/signin`
3. Test both authentication methods
4. Verify admin access works
5. Test with unauthorized email (should fail)

## Support

For additional help:
- Check the validation script output: `npm run auth:validate`
- Review environment variables in `.env.example`
- Consult NextAuth.js documentation
- Check application logs for detailed error messages