# Production Environment Setup Script
Write-Host "Setting up production environment variables..." -ForegroundColor Green

# Set environment variables for production
npx vercel env add NEXTAUTH_SECRET production
npx vercel env add NEXTAUTH_URL production
npx vercel env add GOOGLE_CLIENT_SECRET production
npx vercel env add ALLOWED_ADMIN_EMAILS production
npx vercel env add ALLOWED_GMAIL_DOMAINS production

Write-Host "Environment variables set successfully!" -ForegroundColor Green
Write-Host "Now redeploy your application:" -ForegroundColor Yellow
Write-Host "npx vercel --prod" -ForegroundColor Cyan
