#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔐 Validating Authentication Configuration...\n');

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file not found!');
    console.log('Please create .env.local with your authentication configuration first.');
    console.log('See .env.example for reference.\n');
    process.exit(1);
}

// Parse environment variables
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
    }
});

// Set environment variables for validation
Object.keys(envVars).forEach(key => {
    process.env[key] = envVars[key];
});

// Validation functions (implemented here since we can't easily import TS)
function validateCredentialsAuthConfig() {
    const errors = [];
    let allowedEmailsCount = 0;

    // Validate ALLOWED_ADMIN_EMAILS format and content
    const allowedEmails = process.env.ALLOWED_ADMIN_EMAILS;
    if (!allowedEmails) {
        errors.push('ALLOWED_ADMIN_EMAILS is required for credentials authentication');
    } else {
        const emails = allowedEmails.split(',').map(e => e.trim()).filter(e => e.length > 0);
        allowedEmailsCount = emails.length;

        if (emails.length === 0) {
            errors.push('ALLOWED_ADMIN_EMAILS must contain at least one email address');
        } else {
            // Validate email format for each email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const invalidEmails = emails.filter(email => !emailRegex.test(email));

            if (invalidEmails.length > 0) {
                errors.push(`Invalid email format in ALLOWED_ADMIN_EMAILS: ${invalidEmails.join(', ')}`);
            }

            // Check for duplicate emails
            const uniqueEmails = new Set(emails.map(e => e.toLowerCase()));
            if (uniqueEmails.size !== emails.length) {
                errors.push('ALLOWED_ADMIN_EMAILS contains duplicate email addresses');
            }
        }
    }

    // Validate NextAuth configuration for credentials provider
    if (!process.env.NEXTAUTH_SECRET) {
        errors.push('NEXTAUTH_SECRET is required for secure session handling');
    } else if (process.env.NEXTAUTH_SECRET.length < 32) {
        errors.push('NEXTAUTH_SECRET should be at least 32 characters long for security');
    }

    if (!process.env.NEXTAUTH_URL) {
        errors.push('NEXTAUTH_URL is required for proper callback handling');
    } else {
        try {
            new URL(process.env.NEXTAUTH_URL);
        } catch {
            errors.push('NEXTAUTH_URL must be a valid URL');
        }
    }

    return {
        isValid: errors.length === 0,
        allowedEmailsCount,
        errors
    };
}

function validateGoogleAuthServiceConfig() {
    const errors = [];

    // Check if Google OAuth credentials are available (for fallback)
    if (!process.env.GOOGLE_CLIENT_ID) {
        errors.push('GOOGLE_CLIENT_ID is recommended as fallback authentication method');
    }

    if (!process.env.GOOGLE_CLIENT_SECRET) {
        errors.push('GOOGLE_CLIENT_SECRET is recommended as fallback authentication method');
    }

    // Validate environment for production readiness
    if (process.env.NODE_ENV === 'production') {
        if (process.env.NEXTAUTH_URL?.includes('localhost')) {
            errors.push('NEXTAUTH_URL should not use localhost in production');
        }

        if (process.env.NEXTAUTH_SECRET === 'your-super-secret-key-change-this-in-production') {
            errors.push('NEXTAUTH_SECRET must be changed from default value in production');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

function checkProductionEnvironment() {
    const requiredEnvVars = [
        'NEXTAUTH_SECRET',
        'NEXTAUTH_URL',
        'DATABASE_URL',
        'ALLOWED_ADMIN_EMAILS'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:', missingVars);
        return false;
    }

    // Validate credentials authentication configuration
    const credentialsValidation = validateCredentialsAuthConfig();
    if (!credentialsValidation.isValid) {
        console.error('❌ Credentials authentication configuration errors:', credentialsValidation.errors);
        return false;
    }

    return true;
}

let hasErrors = false;

// Validate credentials authentication configuration
console.log('📧 Validating Credentials Authentication...');
const credentialsValidation = validateCredentialsAuthConfig();

if (credentialsValidation.isValid) {
    console.log(`✅ Credentials authentication configuration is valid`);
    console.log(`   - ${credentialsValidation.allowedEmailsCount} admin email(s) configured`);
} else {
    console.log('❌ Credentials authentication configuration errors:');
    credentialsValidation.errors.forEach(error => {
        console.log(`   - ${error}`);
    });
    hasErrors = true;
}

// Validate Google authentication service configuration
console.log('\n🔧 Validating Google Authentication Service...');
const googleValidation = validateGoogleAuthServiceConfig();

if (googleValidation.isValid) {
    console.log('✅ Google authentication service configuration is valid');
} else {
    console.log('⚠️  Google authentication service warnings:');
    googleValidation.errors.forEach(error => {
        console.log(`   - ${error}`);
    });
    // These are warnings, not errors for credentials auth
}

// Run full production environment check
console.log('\n🌐 Running Full Environment Check...');
const productionCheck = checkProductionEnvironment();

if (productionCheck) {
    console.log('✅ All environment variables and configurations are valid');
} else {
    hasErrors = true;
}

// Summary
console.log('\n📋 Configuration Summary:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (envVars.ALLOWED_ADMIN_EMAILS) {
    const emails = envVars.ALLOWED_ADMIN_EMAILS.split(',').map(e => e.trim());
    console.log(`📧 Admin Emails: ${emails.length} configured`);
    emails.forEach((email, index) => {
        console.log(`   ${index + 1}. ${email}`);
    });
}

console.log(`🔐 NextAuth Secret: ${envVars.NEXTAUTH_SECRET ? 'Configured' : 'Missing'}`);
console.log(`🌐 NextAuth URL: ${envVars.NEXTAUTH_URL || 'Missing'}`);
console.log(`🔑 Google OAuth: ${envVars.GOOGLE_CLIENT_ID && envVars.GOOGLE_CLIENT_SECRET ? 'Configured' : 'Missing'}`);

console.log('\n🚀 Authentication Methods Available:');
if (credentialsValidation.isValid) {
    console.log('   ✅ Email/Password Authentication');
}
if (envVars.GOOGLE_CLIENT_ID && envVars.GOOGLE_CLIENT_SECRET) {
    console.log('   ✅ Google OAuth Authentication');
}

if (hasErrors) {
    console.log('\n❌ Configuration validation failed!');
    console.log('Please fix the errors above before proceeding.');
    console.log('\n📖 For help, see:');
    console.log('   - .env.example for configuration reference');
    console.log('   - Authentication documentation in your project');
    process.exit(1);
} else {
    console.log('\n✅ Authentication configuration is ready!');
    console.log('\n🎉 You can now:');
    console.log('   - Start the development server: npm run dev');
    console.log('   - Sign in with email/password using configured admin emails');
    if (envVars.GOOGLE_CLIENT_ID && envVars.GOOGLE_CLIENT_SECRET) {
        console.log('   - Sign in with Google OAuth as fallback');
    }
}