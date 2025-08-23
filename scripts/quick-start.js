#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Ruscles Website - Quick Database Setup\n');

console.log('📋 Prerequisites:');
console.log('  ✅ Node.js and pnpm installed');
console.log('  ✅ PostgreSQL installed and running');
console.log('  ✅ Access to create databases and users\n');

console.log('🔧 Step-by-step setup:\n');

console.log('1️⃣  Create PostgreSQL database and user:');
console.log('   psql -U postgres');
console.log('   CREATE DATABASE ruscles_website;');
console.log('   CREATE USER ruscles_user WITH PASSWORD \'your_password\';');
console.log('   GRANT ALL PRIVILEGES ON DATABASE ruscles_website TO ruscles_user;');
console.log('   \\q\n');

console.log('2️⃣  Create .env.local file with your database credentials:');
console.log('   DATABASE_URL="postgresql://ruscles_user:your_password@localhost:5432/ruscles_website"\n');

console.log('3️⃣  Run the setup script:');
console.log('   pnpm run db:setup\n');

console.log('4️⃣  Or run commands manually:');
console.log('   pnpm install');
console.log('   npx prisma generate');
console.log('   npx prisma migrate dev --name init');
console.log('   pnpm run db:seed\n');

console.log('5️⃣  Start your development server:');
console.log('   pnpm dev\n');

console.log('6️⃣  Access your application:');
console.log('   - Website: http://localhost:3000');
console.log('   - Admin: http://localhost:3000/admin');
console.log('   - Database Studio: npx prisma studio');
console.log('   - API Health: http://localhost:3000/api/db/health\n');

console.log('📚 For detailed instructions, see: DATABASE_SETUP.md\n');

console.log('🔍 Troubleshooting:');
console.log('   - Check if PostgreSQL is running');
console.log('   - Verify database credentials in .env.local');
console.log('   - Ensure database and user exist with proper permissions');
console.log('   - Check console output for specific error messages\n');

console.log('💡 Tips:');
console.log('   - Use pnpm run db:studio to view your data');
console.log('   - Use pnpm run db:reset to clear data (development only)');
console.log('   - Check /api/db/health for database status');
console.log('   - Database management is available in Admin > Settings > System\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    console.log('✅ .env.local file found!');
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('DATABASE_URL=')) {
        console.log('✅ DATABASE_URL is configured');
        console.log('\n🚀 You\'re ready to run: pnpm run db:setup');
    } else {
        console.log('❌ DATABASE_URL not found in .env.local');
        console.log('   Please add your database connection string');
    }
} else {
    console.log('❌ .env.local file not found');
    console.log('   Please create it with your database configuration');
}

console.log('\n🎯 Happy coding!');
