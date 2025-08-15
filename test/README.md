# Form Content Management System - Testing Suite

This comprehensive testing suite ensures the reliability, performance, and accessibility of the form and content management system.

## Test Structure

### 📁 Components Tests (`test/components/`)
Unit tests for core UI components:
- **FormsTable** - Form listing, filtering, sorting, and bulk actions
- **FormDetailView** - Individual form viewing and response management
- **RichTextEditor** - Content editing with formatting capabilities
- **ImageUpload** - File upload with validation and preview

### 📁 Hooks Tests (`test/hooks/`)
Tests for custom React hooks:
- **use-forms** - Form data management and operations
- **use-blog** - Blog post CRUD operations and filtering
- **use-testimonials** - Testimonial management and ordering
- **use-portfolio** - Portfolio item management and categorization

### 📁 Integration Tests (`test/integration/`)
End-to-end workflow tests:
- **form-workflow** - Complete form submission and response process
- Form status updates and real-time synchronization
- Multi-user concurrent operations

### 📁 E2E Tests (`test/e2e/`)
Complete user journey tests:
- **content-publishing** - Full content creation and publishing workflow
- Blog post creation, editing, and scheduling
- Testimonial and portfolio item management
- Image upload and media management

### 📁 Performance Tests (`test/performance/`)
Performance and scalability tests:
- **large-datasets** - Handling thousands of form submissions
- **image-upload** - Large file upload performance
- Memory usage and cleanup
- UI responsiveness under load

### 📁 Accessibility Tests (`test/accessibility/`)
WCAG 2.1 AA compliance tests:
- **wcag-compliance** - Automated accessibility testing
- Keyboard navigation support
- Screen reader compatibility
- Color contrast and visual accessibility

## Running Tests

### Quick Start
```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:components
npm run test:hooks
npm run test:integration
npm run test:e2e
npm run test:performance
npm run test:accessibility

# Run with coverage
npm run test:coverage

# Interactive test UI
npm run test:ui
```

### Individual Test Commands
```bash
# Run specific test file
npx vitest run test/components/forms-table.test.tsx

# Watch mode for development
npx vitest test/components/forms-table.test.tsx

# Debug mode
npx vitest run test/components/forms-table.test.tsx --reporter=verbose
```

## Test Configuration

### Vitest Configuration (`vitest.config.ts`)
- **Environment**: jsdom for DOM testing
- **Setup**: Automated mocking and test utilities
- **Coverage**: v8 coverage provider
- **Aliases**: Path resolution for imports

### Test Setup (`test/setup.ts`)
- Jest DOM matchers
- Next.js router mocking
- Window API mocking (matchMedia, IntersectionObserver, etc.)
- Global test utilities

## Writing Tests

### Component Testing Pattern
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComponentName } from '@/path/to/component'

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName prop="value" />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('should handle user interactions', async () => {
    const user = userEvent.setup()
    const mockHandler = vi.fn()
    
    render(<ComponentName onAction={mockHandler} />)
    
    await user.click(screen.getByRole('button'))
    expect(mockHandler).toHaveBeenCalled()
  })
})
```

### Hook Testing Pattern
```typescript
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCustomHook } from '@/hooks/use-custom-hook'

describe('useCustomHook', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useCustomHook())
    expect(result.current.data).toEqual([])
  })

  it('should handle async operations', async () => {
    const { result } = renderHook(() => useCustomHook())
    
    await act(async () => {
      await result.current.fetchData()
    })
    
    await waitFor(() => {
      expect(result.current.data).toHaveLength(1)
    })
  })
})
```

### Performance Testing Guidelines
- Use `performance.now()` for timing measurements
- Test with realistic data volumes (1000+ items)
- Monitor memory usage with `performance.memory`
- Verify UI responsiveness during operations

### Accessibility Testing Guidelines
- Use `jest-axe` for automated accessibility testing
- Test keyboard navigation paths
- Verify ARIA labels and roles
- Check color contrast ratios
- Test with screen reader simulation

## Coverage Requirements

### Minimum Coverage Targets
- **Statements**: 90%
- **Branches**: 85%
- **Functions**: 90%
- **Lines**: 90%

### Critical Components (100% Coverage Required)
- Form submission handling
- Data validation logic
- Error handling and recovery
- Security-related functions

## Continuous Integration

### Pre-commit Hooks
```bash
# Run linting and tests before commit
npm run lint && npm run test:run
```

### CI Pipeline
1. **Unit Tests** - Fast feedback on component functionality
2. **Integration Tests** - Workflow validation
3. **Performance Tests** - Regression detection
4. **Accessibility Tests** - Compliance verification
5. **Coverage Report** - Quality metrics

## Troubleshooting

### Common Issues

#### Mock Not Working
```typescript
// Ensure mocks are cleared between tests
beforeEach(() => {
  vi.clearAllMocks()
})
```

#### Async Test Timeouts
```typescript
// Increase timeout for slow operations
await waitFor(() => {
  expect(condition).toBeTruthy()
}, { timeout: 5000 })
```

#### DOM Cleanup
```typescript
// Use cleanup for proper test isolation
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
```

### Performance Test Debugging
- Use `--reporter=verbose` for detailed timing
- Monitor browser DevTools during test runs
- Profile memory usage with heap snapshots

### Accessibility Test Debugging
- Use browser accessibility tools
- Test with actual screen readers
- Validate against WCAG guidelines manually

## Best Practices

### Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests focused and atomic

### Mocking Strategy
- Mock external dependencies
- Use realistic mock data
- Avoid over-mocking internal logic
- Reset mocks between tests

### Performance Considerations
- Use `vi.useFakeTimers()` for time-dependent tests
- Mock heavy operations in unit tests
- Run performance tests in isolation
- Monitor test execution time

### Accessibility Standards
- Test with keyboard only
- Verify screen reader announcements
- Check color contrast programmatically
- Test with various viewport sizes

## Reporting

### Test Reports
- **JSON Report**: `test-report.json` - Detailed results
- **Coverage Report**: `coverage/` - HTML coverage report
- **Console Output**: Real-time test progress

### Metrics Tracked
- Test execution time
- Coverage percentages
- Performance benchmarks
- Accessibility violations
- Flaky test detection

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all test categories are covered
3. Update this documentation
4. Verify CI pipeline passes
5. Review coverage reports

For questions or issues with the testing suite, please refer to the project documentation or create an issue in the repository.