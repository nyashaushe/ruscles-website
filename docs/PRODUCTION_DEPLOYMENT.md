# Production Deployment Guide

## 🚀 Getting Your App Ready for Production

This guide will walk you through deploying your Next.js app with Google OAuth and email/password authentication to production.

## Prerequisites

- ✅ Authentication system implemented and tested
- ✅ Vercel account (recommended) or other hosting platform
- ✅ Google Cloud Console access for OAuth setup
- ✅ Database provider (recommended: PlanetScale, Supabase, or Neon)

## Step 1: Database Setup

### Option A: PlanetScale (Recommended)
1. Go to [PlanetScale](https://planetscale.com/)
2. Create a new database
3. Get your connection string from the dashboard
4. It will look like: `mysql://username:password@host/database?sslaccept=strict`

### Option B: Supabase
1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string (URI format)

### Option C: Neon (PostgreSQL)
1. Go to [Neon](https://neon.tech/)
2. Create a new project
3. Copy the connection string from the dashboard

## Step 2: Google OAuth Setup

### Create Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     ```
     https://yourdomain.com/api/auth/callback/google
     ```
   - Replace `yourdomain.com` with your actual domain
5. Copy the Client ID and Client Secret

## Step 3: Vercel Deployment

### Deploy to Vercel
1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Vercel](https://vercel.com/)
3. Import your repository
4. Vercel will auto-detect it's a Next.js project

### Configure Environment Variables in Vercel
Go to your project settings in Vercel and add these environment variables:

#### Required Variables
```bash
# Database
DATABASE_URL=your-production-database-url

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secure-secret-key-32-chars-minimum
NEXTAUTH_URL=https://yourdomain.vercel.app

# Admin Access Control
ALLOWED_ADMIN_EMAILS=admin@yourcompany.com,manager@yourcompany.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Optional Variables
```bash
# WhatsApp Configuration
WHATSAPP_BUSINESS_NUMBER=+1234567890
WHATSAPP_DEFAULT_MESSAGE=Hello! I'm interested in your services.
WHATSAPP_BUSINESS_NAME=Your Business Name
WHATSAPP_ENABLED=true

# Email Configuration (if using email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

### Generate Secure NextAuth Secret
Use one of these methods to generate a secure secret:

```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

## Step 4: Domain Configuration

### Custom Domain (Optional)
1. In Vercel dashboard, go to your project
2. Go to "Settings" > "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `NEXTAUTH_URL` to use your custom domain

### Update Google OAuth Redirect URIs
After deploying, update your Google OAuth credentials:
1. Go back to Google Cloud Console
2. Edit your OAuth 2.0 client
3. Update authorized redirect URIs to include your production domain:
   ```
   https://yourdomain.vercel.app/api/auth/callback/google
   # or if using custom domain:
   https://yourcustomdomain.com/api/auth/callback/google
   ```

## Step 5: Database Migration

### Run Database Setup
After deployment, your database will be automatically set up thanks to the build command in `vercel.json`:

```json
{
    "buildCommand": "prisma generate && next build"
}
```

If you need to manually run migrations:
1. Install Vercel CLI: `npm i -g vercel`
2. Link your project: `vercel link`
3. Run commands: `vercel env pull .env.local`
4. Run migrations: `npx prisma db push`

## Step 6: Validation & Testing

### Validate Configuration
Run the validation script locally with production environment:

```bash
# Create .env.production with your production values
npm run auth:validate
```

### Test Authentication
1. Visit your production site
2. Go to `/auth/signin`
3. Test both authentication methods:
   - Email/password with admin emails
   - Google OAuth
4. Verify admin panel access at `/admin`

### Security Checklist
- [ ] `NEXTAUTH_SECRET` is unique and at least 32 characters
- [ ] `NEXTAUTH_URL` uses HTTPS
- [ ] `ALLOWED_ADMIN_EMAILS` contains only authorized users
- [ ] Google OAuth redirect URIs match your domain
- [ ] Database connection is secure
- [ ] Environment variables are not exposed in client-side code

## Step 7: Monitoring & Maintenance

### Monitor Authentication
- Check Vercel function logs for authentication errors
- Monitor failed login attempts
- Set up alerts for authentication failures

### Regular Maintenance
- Rotate `NEXTAUTH_SECRET` periodically
- Review and update `ALLOWED_ADMIN_EMAILS` as needed
- Keep dependencies updated
- Monitor database performance

## Troubleshooting

### Common Issues

**"Configuration Error"**
- Check all environment variables are set correctly
- Verify `NEXTAUTH_URL` matches your domain exactly
- Ensure `NEXTAUTH_SECRET` is at least 32 characters

**"OAuth Error"**
- Verify Google OAuth redirect URIs match your domain
- Check Google Client ID and Secret are correct
- Ensure Google+ API is enabled

**"Database Connection Error"**
- Verify `DATABASE_URL` is correct
- Check database is accessible from Vercel
- Ensure database allows connections from Vercel IPs

**"Access Denied"**
- Verify email is in `ALLOWED_ADMIN_EMAILS`
- Check email format is correct (no extra spaces)
- Ensure case sensitivity matches

### Debug Mode
Enable debug logging by adding to Vercel environment variables:
```bash
NEXTAUTuction! 🎉rodfor pw ready r app is nooints

Youauth endpor  limiting fg rateaddinnsider **: Congiti. **Rate Limbackups
7 database : RegularBackups**6. **toring
ing and moniloggup ing**: Set 5. **Monitoril list
 admin emaly reviewRegulartrol**: cess Cond
4. **Acupdatependencies *: Keep deates*r Upd **Regula
3.roductionn p HTTPS iways use AlOnly**:. **HTTPS 
2ilesv` fit `.en comm Neverriables**:ironment Va. **Envs

1ctice Praty Best
## Securigs
ion loase connectew databvi
5. Reerrors for OAuth lensod CoGoogle ClouCheck 4. ables
nment variall enviro3. Verify ally
alidate` locn auth:v `npm ru2. Runn logs
l functiok VerceChec. es:
1suisounter encu If youpport

# S
#``
"]
`start "",pm
CMD ["nEXPOSE 3000d
npm run buil .
RUN PY .oduction
COpr --only= ci
RUN npm/kage*.json .Y pacIR /app
COPKD-alpine
WORM node:18FROrfile
```dockeckerfile:
Create Dor)
1. d (Dockete### Self-hosloy

o-depy will autilwaables
3. Raonment varidd enviry
2. Ar repositornnect youCo
1. lway# Raioard

##fy dashbs in Netli variableironment. Add env.next`
4 `tory:ublish direcd`
3. Set puil `npm run bmmand:d co buil Setry
2.ositour repct yone1. Contlify

### Neforms
latployment Pve De# Alternati
```

#H_DEBUG=true