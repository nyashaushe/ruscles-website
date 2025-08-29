# 🚀 Production Setup Guide

## Quick Start Checklist

### 1. Database Setup (Choose One)
- **PlanetScale**: Go to planetscale.com → Create database → Copy connection string
- **Supabase**: Go to supabase.com → New project → Settings → Database → Copy URI
- **Neon**: Go to neon.tech → New project → Copy connection string

### 2. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add redirect URI: `https://yourdomain.vercel.app/api/auth/callback/google`

### 3. Deploy to Vercel
1. Push code to GitHub
2. Go to vercel.com → Import repository
3. Add these environment variables in Vercel dashboard:

```bash
# Required
DATABASE_URL=your-database-connection-string
NEXTAUTH_SECRET=your-32-character-secret-key
NEXTAUTH_URL=https://yourdomain.vercel.app
ALLOWED_ADMIN_EMAILS=admin@yourcompany.com,manager@yourcompany.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional
WHATSAPP_BUSINESS_NUMBER=+1234567890
WHATSAPP_DEFAULT_MESSAGE=Hello! I'm interested in your services.
```

### 4. Generate Secure Secret
```bash
# Run this command to generate NEXTAUTH_SECRET:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 5. Test Your Deployment
1. Visit your deployed site
2. Go to `/auth/signin`
3. Test both login methods
4. Access admin panel at `/admin`

## Environment Variables Explained

### Required Variables
- `DATABASE_URL`: Your database connection string
- `NEXTAUTH_SECRET`: 32+ character secret for JWT signing
- `NEXTAUTH_URL`: Your production domain (https://yourdomain.vercel.app)
- `ALLOWED_ADMIN_EMAILS`: Comma-separated admin emails
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: From Google Cloud Console

### Optional Variables
- `WHATSAPP_*`: For WhatsApp contact functionality
- `SMTP_*`: For email features (if needed)

## Security Checklist
- [ ] NEXTAUTH_SECRET is unique and 32+ characters
- [ ] NEXTAUTH_URL uses HTTPS
- [ ] Only authorized emails in ALLOWED_ADMIN_EMAILS
- [ ] Google OAuth redirect URIs match your domain
- [ ] Environment variables not in code repository

## Troubleshooting

**Configuration Error**: Check all environment variables are set correctly
**OAuth Error**: Verify Google redirect URIs match your domain exactly
**Database Error**: Ensure DATABASE_URL is correct and accessible
**Access Denied**: Verify email is in ALLOWED_ADMIN_EMAILS (no extra spaces)

## Validation
Run locally to validate your config:
```bash
npm run auth:validate
```

Your app will be live at: `https://yourdomain.vercel.app` 🎉