#!/usr/bin/env tsx

/**
 * Test runner for Google Email/Password Authentication feature
 * 
 * This script runs all tests related to the authentication feature:
 * - Unit tests for authentication services
 * - Integration tests for signin flow
 * - Component tests for UI elements
 * - Error handling tests
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import path from 'path'

interface TestSuite {
    name: string
    pattern: string
    description: string
}

const testSuites: TestSuite[] = [
    {
        name: 'Unit Tests - Google Auth Service',
        pattern: 'test/lib/auth/google-auth-service.test.ts',
        description: 'Tests for Google authentication service validation logic'
    },
    {
        name: 'Unit Tests - Email Validator',
        pattern: 'test/lib/auth/email-validator.test.ts',
        description: 'Tests for admin email validation utility'
    },
    {
        name: 'Integration Tests - Credentials Provider',
        pattern: 'test/integration/auth/credentials-provider.test.ts',
        description: 'Tests for NextAuth credentials provider integration'
    },
    {
        name: 'Integration Tests - NextAuth Callbacks',
        pattern: 'test/integration/auth/nextauth-callbacks.test.ts',
        description: 'Tests for NextAuth callback functions and session management'
    },
    {
        name: 'Integration Tests - Signin Flow',
        pattern: 'test/integration/auth/signin-flow.test.ts',
        description: 'End-to-end tests for complete signin flow'
    },
    {
        name: 'Component Tests - Email Input',
        pattern: 'test/components/auth/email-input.test.tsx',
        description: 'Tests for email input component'
    },
    {
        name: 'Component Tests - Password Input',
        pattern: 'test/components/auth/password-input.test.tsx',
        description: 'Tests for password input component with show/hide toggle'
    },
    {
        name: 'Component Tests - Credentials Form',
        pattern: 'test/components/auth/credentials-signin-form.test.tsx',
        description: 'Tests for credentials signin form component'
    },
    {
        name: 'Component Tests - Signin Page',
        pattern: 'test/components/auth/signin-page.test.tsx',
        description: 'Tests for complete signin page layout and functionality'
    },
    {
        name: 'Component Tests - Error Handling',
        pattern: 'test/components/auth/error-handling.test.tsx',
        description: 'Tests for authentication error handling and user feedback'
    }
]

function runTestSuite(suite: TestSuite): boolean {
    console.log(`\n🧪 Running: ${suite.name}`)
    console.log(`📝 ${suite.description}`)

    if (!existsSync(suite.pattern)) {
        console.log(`⚠️  Test file not found: ${suite.pattern}`)
        return false
    }

    try {
        console.log(`📂 Pattern: ${suite.pattern}`)
        execSync(`npx vitest run ${suite.pattern}`, {
            stdio: 'inherit',
            cwd: process.cwd()
        })
        console.log(`✅ ${suite.name} - PASSED`)
        return true
    } catch (error) {
        console.log(`❌ ${suite.name} - FAILED`)
        return false
    }
}

function main() {
    console.log('🚀 Google Email/Password Authentication Test Suite')
    console.log('='.repeat(60))

    const results: { suite: TestSuite; passed: boolean }[] = []

    for (const suite of testSuites) {
        const passed = runTestSuite(suite)
        results.push({ suite, passed })
    }

    // Summary
    console.log('\n📊 Test Results Summary')
    console.log('='.repeat(60))

    const passed = results.filter(r => r.passed).length
    const total = results.length

    results.forEach(({ suite, passed }) => {
        const status = passed ? '✅ PASS' : '❌ FAIL'
        console.log(`${status} ${suite.name}`)
    })

    console.log(`\n🎯 Overall: ${passed}/${total} test suites passed`)

    if (passed === total) {
        console.log('🎉 All authentication tests passed!')
        process.exit(0)
    } else {
        console.log('💥 Some tests failed. Please review the output above.')
        process.exit(1)
    }
}

// Run coverage report for auth-related files
function runCoverage() {
    console.log('\n📈 Running coverage report for authentication files...')

    try {
        execSync('npx vitest run --coverage test/lib/auth test/components/auth test/integration/auth', {
            stdio: 'inherit',
            cwd: process.cwd()
        })
    } catch (error) {
        console.log('⚠️  Coverage report failed, but tests may have passed')
    }
}

// Check if coverage flag is provided
const args = process.argv.slice(2)
if (args.includes('--coverage')) {
    runCoverage()
} else {
    main()
}