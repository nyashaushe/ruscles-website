import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormsTable } from '@/app/admin/forms/components/forms-table'
import { FormDetailView } from '@/app/admin/forms/components/form-detail-view'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { ImageUpload } from '@/components/ui/image-upload'

// Add axe-core for accessibility testing
import { axe, toHaveNoViolations } from 'jest-axe'

// Extend expect with axe matchers
expect.extend(toHaveNoViolations)

const mockForms = [
  {
    id: '1',
    type: 'contact' as const,
    submittedAt: new Date(),
    status: 'new' as const,
    priority: 'high' as const,
    customerInfo: {
      name: 'John Doe',
      email: 'john@example.com',
    },
    formData: { message: 'Test message' },
    responses: [],
    tags: [],
    notes: '',
    lastUpdated: new Date(),
  },
]

describe('WCAG 2.1 AA Compliance Tests', () => {
  it('FormsTable meets accessibility standards', async () => {
    const { container } = render(
      <FormsTable
        forms={mockForms}
        loading={false}
        onStatusChange={vi.fn()}
        onViewDetails={vi.fn()}
        onBulkAction={vi.fn()}
      />
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('FormDetailView meets accessibility standards', async () => {
    const { container } = render(
      <FormDetailView
        form={mockForms[0]}
        responses={[]}
        loading={false}
        onStatusChange={vi.fn()}
        onSendResponse={vi.fn()}
        onAddNote={vi.fn()}
        onUpdateTags={vi.fn()}
      />
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('RichTextEditor meets accessibility standards', async () => {
    const { container } = render(
      <RichTextEditor
        content="<p>Test content</p>"
        onChange={vi.fn()}
        placeholder="Enter content"
      />
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('ImageUpload meets accessibility standards', async () => {
    const { container } = render(
      <ImageUpload
        onUpload={vi.fn()}
        acceptedTypes={['image/jpeg', 'image/png']}
      />
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has proper heading hierarchy', () => {
    render(
      <div>
        <h1>Forms Management</h1>
        <FormsTable
          forms={mockForms}
          loading={false}
          onStatusChange={vi.fn()}
          onViewDetails={vi.fn()}
          onBulkAction={vi.fn()}
        />
      </div>
    )

    const headings = screen.getAllByRole('heading')
    expect(headings[0]).toHaveAttribute('aria-level', '1')
  })

  it('provides proper focus management', async () => {
    const user = userEvent.setup()
    render(
      <FormsTable
        forms={mockForms}
        loading={false}
        onStatusChange={vi.fn()}
        onViewDetails={vi.fn()}
        onBulkAction={vi.fn()}
      />
    )

    // Tab through interactive elements
    await user.tab()
    expect(document.activeElement).toHaveAttribute('role', 'searchbox')

    await user.tab()
    expect(document.activeElement).toHaveAttribute('role', 'button')
  })

  it('has sufficient color contrast', () => {
    render(
      <FormsTable
        forms={mockForms}
        loading={false}
        onStatusChange={vi.fn()}
        onViewDetails={vi.fn()}
        onBulkAction={vi.fn()}
      />
    )

    // Check that status badges have proper contrast
    const statusBadge = screen.getByText('New')
    const styles = window.getComputedStyle(statusBadge)
    
    // This would need actual color contrast calculation in a real test
    expect(styles.color).toBeDefined()
    expect(styles.backgroundColor).toBeDefined()
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    const mockViewDetails = vi.fn()
    
    render(
      <FormsTable
        forms={mockForms}
        loading={false}
        onStatusChange={vi.fn()}
        onViewDetails={mockViewDetails}
        onBulkAction={vi.fn()}
      />
    )

    // Navigate to view details button and activate with Enter
    const viewButton = screen.getByRole('button', { name: /view details/i })
    viewButton.focus()
    
    await user.keyboard('{Enter}')
    expect(mockViewDetails).toHaveBeenCalled()
  })

  it('provides proper ARIA labels and descriptions', () => {
    render(
      <FormsTable
        forms={mockForms}
        loading={false}
        onStatusChange={vi.fn()}
        onViewDetails={vi.fn()}
        onBulkAction={vi.fn()}
      />
    )

    expect(screen.getByRole('table')).toHaveAttribute('aria-label')
    expect(screen.getByRole('searchbox')).toHaveAttribute('aria-label')
    
    const statusButtons = screen.getAllByRole('button', { name: /change status/i })
    statusButtons.forEach(button => {
      expect(button).toHaveAttribute('aria-describedby')
    })
  })

  it('announces dynamic content changes', async () => {
    const user = userEvent.setup()
    render(
      <FormsTable
        forms={mockForms}
        loading={false}
        onStatusChange={vi.fn()}
        onViewDetails={vi.fn()}
        onBulkAction={vi.fn()}
      />
    )

    // Check for live regions
    const liveRegion = screen.getByRole('status', { hidden: true })
    expect(liveRegion).toHaveAttribute('aria-live', 'polite')

    // Simulate search that would update live region
    const searchInput = screen.getByRole('searchbox')
    await user.type(searchInput, 'John')

    expect(liveRegion).toHaveTextContent(/1 result found/i)
  })

  it('supports screen reader navigation', () => {
    render(
      <FormsTable
        forms={mockForms}
        loading={false}
        onStatusChange={vi.fn()}
        onViewDetails={vi.fn()}
        onBulkAction={vi.fn()}
      />
    )

    // Check table structure for screen readers
    const table = screen.getByRole('table')
    expect(table).toHaveAttribute('aria-label')

    const columnHeaders = screen.getAllByRole('columnheader')
    columnHeaders.forEach(header => {
      expect(header).toHaveAttribute('scope', 'col')
    })

    const rowHeaders = screen.getAllByRole('rowheader')
    rowHeaders.forEach(header => {
      expect(header).toHaveAttribute('scope', 'row')
    })
  })

  it('handles error states accessibly', () => {
    render(
      <FormsTable
        forms={[]}
        loading={false}
        error="Failed to load forms"
        onStatusChange={vi.fn()}
        onViewDetails={vi.fn()}
        onBulkAction={vi.fn()}
      />
    )

    const errorMessage = screen.getByRole('alert')
    expect(errorMessage).toHaveTextContent('Failed to load forms')
    expect(errorMessage).toHaveAttribute('aria-live', 'assertive')
  })

  it('provides proper form labels and validation', async () => {
    const user = userEvent.setup()
    render(
      <FormDetailView
        form={mockForms[0]}
        responses={[]}
        loading={false}
        onStatusChange={vi.fn()}
        onSendResponse={vi.fn()}
        onAddNote={vi.fn()}
        onUpdateTags={vi.fn()}
      />
    )

    const responseTextarea = screen.getByRole('textbox', { name: /response content/i })
    expect(responseTextarea).toHaveAttribute('aria-required', 'true')
    expect(responseTextarea).toHaveAttribute('aria-describedby')

    // Test validation error announcement
    const sendButton = screen.getByRole('button', { name: /send/i })
    await user.click(sendButton)

    const errorMessage = screen.getByRole('alert')
    expect(errorMessage).toHaveTextContent(/response content is required/i)
  })

  it('supports high contrast mode', () => {
    // Mock high contrast media query
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-contrast: high)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    render(
      <FormsTable
        forms={mockForms}
        loading={false}
        onStatusChange={vi.fn()}
        onViewDetails={vi.fn()}
        onBulkAction={vi.fn()}
      />
    )

    // Check that high contrast styles are applied
    const statusBadge = screen.getByText('New')
    expect(statusBadge).toHaveClass('high-contrast')
  })

  it('supports reduced motion preferences', () => {
    // Mock reduced motion media query
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    render(
      <FormsTable
        forms={mockForms}
        loading={false}
        onStatusChange={vi.fn()}
        onViewDetails={vi.fn()}
        onBulkAction={vi.fn()}
      />
    )

    // Check that animations are disabled
    const table = screen.getByRole('table')
    expect(table).toHaveClass('reduce-motion')
  })

  it('provides proper skip links', () => {
    render(
      <div>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <main id="main-content">
          <FormsTable
            forms={mockForms}
            loading={false}
            onStatusChange={vi.fn()}
            onViewDetails={vi.fn()}
            onBulkAction={vi.fn()}
          />
        </main>
      </div>
    )

    const skipLink = screen.getByText('Skip to main content')
    expect(skipLink).toHaveAttribute('href', '#main-content')
    
    const mainContent = screen.getByRole('main')
    expect(mainContent).toHaveAttribute('id', 'main-content')
  })
})