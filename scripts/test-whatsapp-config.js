/**
 * Test script to verify WhatsApp environment configuration
 * Run with: node scripts/test-whatsapp-config.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🧪 Testing WhatsApp Configuration...\n');

// Check environment variables
const requiredVars = [
    'WHATSAPP_BUSINESS_NUMBER',
    'WHATSAPP_DEFAULT_MESSAGE',
    'WHATSAPP_BUSINESS_NAME',
    'WHATSAPP_ENABLED'
];

const optionalVars = [
    'WHATSAPP_USE_CUSTOM_WELCOME',
    'WHATSAPP_WELCOME_MESSAGE',
    'WHATSAPP_INCLUDE_BUSINESS_NAME',
    'WHATSAPP_INCLUDE_TIMESTAMP'
];

console.log('📋 Required Environment Variables:');
requiredVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    console.log(`${status} ${varName}: ${value || 'NOT SET'}`);
});

console.log('\n📋 Optional Environment Variables:');
optionalVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '⚪';
    console.log(`${status} ${varName}: ${value || 'not set (using default)'}`);
});

// Test phone number format
const phoneNumber = process.env.WHATSAPP_BUSINESS_NUMBER;
if (phoneNumber) {
    console.log('\n📞 Phone Number Validation:');

    // Basic validation
    const isValidFormat = /^\+[1-9]\d{6,14}$/.test(phoneNumber.replace(/[^\d+]/g, ''));
    console.log(`${isValidFormat ? '✅' : '❌'} Format: ${phoneNumber}`);

    if (isValidFormat) {
        console.log('✅ Phone number format is valid for WhatsApp');

        // Generate test URLs
        const cleanNumber = phoneNumber.replace(/[^\d+]/g, '').substring(1);
        const testMessage = encodeURIComponent('Hello! Test message from Ruscle Investments.');

        console.log('\n🔗 Generated URLs:');
        console.log(`📱 Mobile: whatsapp://send?phone=${cleanNumber}&text=${testMessage}`);
        console.log(`🌐 Web: https://wa.me/${cleanNumber}?text=${testMessage}`);
    } else {
        console.log('❌ Phone number format is invalid. Use international format like +263777123456');
    }
}

// Test configuration loading
console.log('\n🔧 Testing Configuration Loading:');
try {
    // This would normally import from your lib, but we'll simulate it
    const config = {
        phoneNumber: process.env.WHATSAPP_BUSINESS_NUMBER || '',
        defaultMessage: process.env.WHATSAPP_DEFAULT_MESSAGE || "Hello! I'm interested in your services.",
        businessName: process.env.WHATSAPP_BUSINESS_NAME || 'Business',
        enabled: process.env.WHATSAPP_ENABLED !== 'false'
    };

    console.log('✅ Configuration loaded successfully:');
    console.log(`   📞 Phone: ${config.phoneNumber}`);
    console.log(`   💬 Message: ${config.defaultMessage.substring(0, 50)}...`);
    console.log(`   🏢 Business: ${config.businessName}`);
    console.log(`   🟢 Enabled: ${config.enabled}`);

} catch (error) {
    console.log('❌ Configuration loading failed:', error.message);
}

console.log('\n🎉 Test completed!');
console.log('\nIf you see any ❌ marks above, please check your .env.local file.');
console.log('Make sure all required environment variables are set correctly.');