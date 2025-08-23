#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Ruscles Website Database...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file not found!');
    console.log('Please create .env.local with your database configuration first.');
    console.log('See DATABASE_SETUP.md for instructions.\n');
    process.exit(1);
}

// Check if DATABASE_URL is set
const envContent = fs.readFileSync(envPath, 'utf8');
if (!envContent.includes('DATABASE_URL=')) {
    console.log('❌ DATABASE_URL not found in .env.local!');
    console.log('Please add your database connection string to .env.local\n');
    process.exit(1);
}

try {
    console.log('📦 Installing dependencies...');
    execSync('pnpm install', { stdio: 'inherit' });

    console.log('\n🔧 Generating Prisma client...');
    execSync('npx dotenv -e .env.local -- prisma generate', { stdio: 'inherit' });

    console.log('\n🗄️  Running database migrations...');
    execSync('npx dotenv -e .env.local -- prisma migrate dev --name init', { stdio: 'inherit' });

    console.log('\n🌱 Seeding database with initial data...');
    execSync('npx dotenv -e .env.local -- prisma db seed', { stdio: 'inherit' });

    console.log('\n✅ Database setup completed successfully!');
    console.log('\n📊 You can now:');
    console.log('  - View your data: npx dotenv -e .env.local -- prisma studio');
    console.log('  - Check database health: GET /api/db/health');
    console.log('  - Seed database: POST /api/db/seed');
    console.log('  - Reset database: POST /api/db/reset (development only)');

} catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    console.log('\n🔍 Troubleshooting tips:');
    console.log('  1. Make sure PostgreSQL is running');
    console.log('  2. Verify your DATABASE_URL in .env.local');
    console.log('  3. Check if the database and user exist');
    console.log('  4. Ensure the user has proper permissions');
    console.log('\n📖 See DATABASE_SETUP.md for detailed instructions.');
    process.exit(1);
}
