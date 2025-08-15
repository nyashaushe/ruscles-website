#!/usr/bin/env node

/**
 * Comprehensive test runner for the form content management system
 * This script runs all test suites and generates a comprehensive report
 */

import { execSync } from 'child_process'
import { writeFileSync } from 'fs'

interface TestSuite {
  name: string
  pattern: string
  description: string
}

const testSuites: TestSuite[] = [
  {
    name: 'Unit Tests - Components',
    pattern: 'test/components/**/*.test.tsx',
    description: 'Tests for core UI components (FormsTable, FormDetailView, RichTextEditor, ImageUpload)',
  },
  {
    name: 'Unit Tests - Hooks',
    pattern: 'test/hooks/**/*.test.tsx',
    description: 'Tests for custom React hooks (use-forms, use-blog, use-testimonials, use-portfolio)',
  },
  {
    name: 'Integration Tests',
    pattern: 'test/integration/**/*.test.tsx',
    description: 'Tests for form submission and response workflows',
  },
  {
    name: 'End-to-End Tests',
    pattern: 'test/e2e/**/*.test.tsx',
    description: 'Tests for complete content creation and publishing processes',
  },
  {
    name: 'Performance Tests',
    pattern: 'test/performance/**/*.test.tsx',
    description: 'Tests for large datasets and image upload functionality performance',
  },
  {
    name: 'Accessibility Tests',
    pattern: 'test/accessibility/**/*.test.tsx',
    description: 'Tests for WCAG 2.1 AA compliance',
  },
]

interface TestResult {
  suite: string
  passed: number
  failed: number
  skipped: number
  duration: number
  coverage?: {
    lines: number
    functions: number
    branches: number
    statements: number
  }
}

async function runTestSuite(suite: TestSuite): Promise<TestResult> {
  console.log(`\n🧪 Running ${suite.name}...`)
  console.log(`📝 ${suite.description}`)
  
  const startTime = Date.now()
  
  try {
    const output = execSync(
      `npx vitest run --reporter=json ${suite.pattern}`,
      { encoding: 'utf-8', stdio: 'pipe' }
    )
    
    const result = JSON.parse(output)
    const duration = Date.now() - startTime
    
    const testResult: TestResult = {
      suite: suite.name,
      passed: result.numPassedTests || 0,
      failed: result.numFailedTests || 0,
      skipped: result.numPendingTests || 0,
      duration,
    }
    
    console.log(`✅ ${testResult.passed} passed, ❌ ${testResult.failed} failed, ⏭️ ${testResult.skipped} skipped`)
    console.log(`⏱️ Duration: ${duration}ms`)
    
    return testResult
    
  } catch (error) {
    console.error(`❌ Test suite failed: ${error}`)
    
    return {
      suite: suite.name,
      passed: 0,
      failed: 1,
      skipped: 0,
      duration: Date.now() - startTime,
    }
  }
}

async function generateCoverageReport(): Promise<void> {
  console.log('\n📊 Generating coverage report...')
  
  try {
    execSync('npx vitest run --coverage', { stdio: 'inherit' })
    console.log('✅ Coverage report generated')
  } catch (error) {
    console.error('❌ Failed to generate coverage report:', error)
  }
}

async function runAllTests(): Promise<void> {
  console.log('🚀 Starting comprehensive test suite for Form Content Management System')
  console.log('=' .repeat(80))
  
  const results: TestResult[] = []
  
  // Run each test suite
  for (const suite of testSuites) {
    const result = await runTestSuite(suite)
    results.push(result)
  }
  
  // Generate coverage report
  await generateCoverageReport()
  
  // Generate summary report
  console.log('\n📋 Test Summary Report')
  console.log('=' .repeat(80))
  
  let totalPassed = 0
  let totalFailed = 0
  let totalSkipped = 0
  let totalDuration = 0
  
  results.forEach(result => {
    totalPassed += result.passed
    totalFailed += result.failed
    totalSkipped += result.skipped
    totalDuration += result.duration
    
    const status = result.failed === 0 ? '✅' : '❌'
    console.log(`${status} ${result.suite}: ${result.passed}/${result.passed + result.failed} tests passed`)
  })
  
  console.log('\n📊 Overall Statistics:')
  console.log(`Total Tests: ${totalPassed + totalFailed + totalSkipped}`)
  console.log(`Passed: ${totalPassed}`)
  console.log(`Failed: ${totalFailed}`)
  console.log(`Skipped: ${totalSkipped}`)
  console.log(`Total Duration: ${totalDuration}ms`)
  console.log(`Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(2)}%`)
  
  // Generate detailed report file
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: totalPassed + totalFailed + totalSkipped,
      passed: totalPassed,
      failed: totalFailed,
      skipped: totalSkipped,
      duration: totalDuration,
      successRate: (totalPassed / (totalPassed + totalFailed)) * 100,
    },
    suites: results,
  }
  
  writeFileSync('test-report.json', JSON.stringify(reportData, null, 2))
  console.log('\n📄 Detailed report saved to test-report.json')
  
  // Exit with appropriate code
  if (totalFailed > 0) {
    console.log('\n❌ Some tests failed. Please review the results above.')
    process.exit(1)
  } else {
    console.log('\n🎉 All tests passed successfully!')
    process.exit(0)
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error('💥 Test runner failed:', error)
  process.exit(1)
})