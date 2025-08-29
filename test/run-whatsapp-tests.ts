/**
 * Test runner for WhatsApp button comprehensive test suite
 * Runs all WhatsApp-related tests and provides summary
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

const testFiles = [
    'test/utils/whatsapp.test.ts',
    'test/components/whatsapp-button.test.tsx',
    'test/integration/whatsapp-url-generation.test.ts',
    'test/integration/whatsapp-responsive.test.tsx',
    'test/accessibility/whatsapp-button-comprehensive.test.tsx',
];

console.log('🧪 Running WhatsApp Button Comprehensive Test Suite\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

for (const testFile of testFiles) {
    if (!existsSync(testFile)) {
        console.log(`❌ Test file not found: ${testFile}`);
        continue;
    }

    console.log(`📋 Running: ${testFile}`);

    try {
        const result = execSync(`npx vitest run ${testFile} --reporter=basic`, {
            encoding: 'utf8',
            stdio: 'pipe'
        });

        console.log(`✅ Passed: ${testFile}`);
        passedTests++;

        // Extract test count from output if possible
        const testCountMatch = result.match(/(\d+) passed/);
        if (testCountMatch) {
            totalTests += parseInt(testCountMatch[1]);
        }

    } catch (error) {
        console.log(`❌ Failed: ${testFile}`);
        console.log(`   Error: ${error.message}`);
        failedTests++;
    }

    console.log('');
}

console.log('📊 Test Suite Summary:');
console.log(`   Total test files: ${testFiles.length}`);
console.log(`   Passed: ${passedTests}`);
console.log(`   Failed: ${failedTests}`);
console.log(`   Total individual tests: ${totalTests}`);

if (failedTests === 0) {
    console.log('\n🎉 All WhatsApp button tests passed!');
    process.exit(0);
} else {
    console.log('\n⚠️  Some tests failed. Please check the output above.');
    process.exit(1);
}