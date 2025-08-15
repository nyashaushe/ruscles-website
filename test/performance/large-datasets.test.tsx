import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormsTable } from '@/app/admin/forms/components/forms-table'
import { FormSubmission } from '@/lib/types/forms'

// Generate large dataset for testing
const generateMockForms = (count: number): FormSubmission[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `form-${index + 1}`,
    type: ['contact', 'service_inquiry', 'quote_request'][index % 3] as any,
    submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    status: ['new', 'in_progress', 'completed', 'archived'][index % 4] as any,
    priority: ['low', 'medium', 'high', 'urgent'][index % 4] as any,
    customerInfo: {
      name: `Customer ${index + 1}`,
      email: `customer${index + 1}@example.com`,
      phone: `555-${String(index + 1).padStart(4, '0')}`,
    },
    formData: {
      message: `This is a test message for form ${index + 1}`,
      service: ['electrical', 'hvac', 'refrigeration'][index % 3],
    },
    responses: [],
    tags: [`tag${index % 10}`, `category${index % 5}`],
    notes: index % 10 === 0 ? `Important note for form ${index + 1}` : '',
    lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  }))
}

describe('Performance Tests - Large Datasets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders 1000 forms efficiently', async () => {
    const largeForms = generateMockForms(1000)
    const startTime = performance.now()
    
    render(
      <FormsTable
        forms={largeForms}
        loading={false}
        onStatusChange={vi.fn()}
        onViewDetails={vi.fn()}
        onBulkAction={vi.fn()}
      />
    )
    
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    // Should render within reasonable time (less than 1 second)
    expect(renderTime).toBeLessThan(1000)
    
    // Should show pagination for large datasets
    expect(screen.getByText(/showing \d+ to \d+ of 1000/i)).toBeInTheDocument()
    
    // Should only render visible rows (virtualization)
    const visibleRows = screen.getAllByRole('row')
    expect(visibleRows.length).toBeLessThan(100) // Should not render all 1000 rows
  })

  it('filters large dataset efficiently', async () => {
    const user = userEvent.setup()
    const largeForms = generateMockForms(5000)
    
    render(
      <FormsTable
        forms={largeForms}
        loading={false}
        onStatusChange={vi.fn()}
        onViewDetails={vi.fn()}
        onBulkAction={vi.fn()}
      />
    )
    
    const searchInput = screen.getByPlaceholderText(/search forms/i)
    
    const startTime = performance.now()
    await user.type(searchInput, 'Customer 1')
    const endTime = performance.now()
    
    const filterTime = endTime - startTime
    
    // Filtering should be fast (less than 500ms)
    expect(filterTime).toBeLessThan(500)
    
    // Should show filtered results
    await waitFor(() => {
      const rows = screen.getAllByRole('row')
      expect(rows.length).toBeGreaterThan(1) // Header + filtered results
      expect(rows.length).toBeLessThan(50) // Should be filtered down
    })
  })

  it('sorts large dataset efficiently', async () => {
    const user = userEvent.setup()
    const largeForms = generateMockForms(3000)
    
    render(
      <FormsTable
        forms={largeForms}
        loading={false}
        onStatusChange={vi.fn()}
        onViewDetails={vi.fn()}
        onBulkAction={vi.fn()}
      />
    )
    
    const dateHeader = screen.getByText('Submitted')
    
    const startTime = performance.now()
    await user.click(dateHeader)
    const endTime = performance.now()
    
    const sortTime = endTime - startTime
    
    // Sorting should be fast (less than 300ms)
    expect(sortTime).toBeLessThan(300)
    
    // Should maintain responsive UI
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('handles pagination efficiently', async () => {
    const user = userEvent.setup()
    const largeForms = generateMockForms(2000)
    
    render(
      <FormsTable
        forms={largeForms}
        loading={false}
        onStatusChange={vi.fn()}
        onViewDetails={vi.fn()}
        onBulkAction={vi.fn()}
      />
    )
    
    // Navigate through pages
    const nextButton = screen.getByRole('button', { name: /next/i })
    
    const startTime = performance.now()
    
    // Click through 5 pages
    for (let i = 0; i < 5; i++) {
      await user.click(nextButton)
      await waitFor(() => {
        expect(screen.getByText(/page \d+ of/i)).toBeInTheDocument()
      })
    }
    
    const endTime = performance.now()
    const paginationTime = endTime - startTime
    
    // Pagination should be smooth (less than 1 second for 5 pages)
    expect(paginationTime).toBeLessThan(1000)
  })

  it('maintains performance with complex filters', async () => {
    const user = userEvent.setup()
    const largeForms = generateMockForms(4000)
    
    render(
      <FormsTable
        forms={largeForms}
        loading={false}
        onStatusChange={vi.fn()}
        onViewDetails={vi.fn()}
        onBulkAction={vi.fn()}
      />
    )
    
    const startTime = performance.now()
    
    // Apply multiple filters
    const searchInput = screen.getByPlaceholderText(/search forms/i)
    await user.type(searchInput, 'Customer')
    
    const statusFilter = screen.getByRole('combobox', { name: /status/i })
    await user.selectOptions(statusFilter, 'new')
    
    const priorityFilter = screen.getByRole('combobox', { name: /priority/i })
    await user.selectOptions(priorityFilter, 'high')
    
    const endTime = performance.now()
    const complexFilterTime = endTime - startTime
    
    // Complex filtering should still be fast (less than 800ms)
    expect(complexFilterTime).toBeLessThan(800)
    
    // Should show filtered results
    await waitFor(() => {
      expect(screen.getByText(/filtered results/i)).toBeInTheDocument()
    })
  })

  it('handles bulk operations on large selections efficiently', async () => {
    const user = userEvent.setup()
    const largeForms = generateMockForms(1000)
    const mockBulkAction = vi.fn().mockResolvedValue([])
    
    render(
      <FormsTable
        forms={largeForms}
        loading={false}
        onStatusChange={vi.fn()}
        onViewDetails={vi.fn()}
        onBulkAction={mockBulkAction}
      />
    )
    
    // Select all visible items
    const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i })
    await user.click(selectAllCheckbox)
    
    const startTime = performance.now()
    
    // Perform bulk action
    const bulkActionButton = screen.getByText('Bulk Actions')
    await user.click(bulkActionButton)
    
    const markAsReadOption = screen.getByText('Mark as Read')
    await user.click(markAsReadOption)
    
    const endTime = performance.now()
    const bulkActionTime = endTime - startTime
    
    // Bulk action UI should be responsive (less than 500ms)
    expect(bulkActionTime).toBeLessThan(500)
    
    // Should call bulk action with selected items
    expect(mockBulkAction).toHaveBeenCalled()
  })

  it('maintains memory efficiency with large datasets', async () => {
    const largeForms = generateMockForms(10000)
    
    // Monitor memory usage (simplified)
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0
    
    const { unmount } = render(
      <FormsTable
        forms={largeForms}
        loading={false}
        onStatusChange={vi.fn()}
        onViewDetails={vi.fn()}
        onBulkAction={vi.fn()}
      />
    )
    
    const afterRenderMemory = (performance as any).memory?.usedJSHeapSize || 0
    
    // Unmount component
    unmount()
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc()
    }
    
    const afterUnmountMemory = (performance as any).memory?.usedJSHeapSize || 0
    
    // Memory should not grow excessively
    const memoryGrowth = afterRenderMemory - initialMemory
    const memoryLeakage = afterUnmountMemory - initialMemory
    
    // Should not use excessive memory (less than 50MB for 10k items)
    expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024)
    
    // Should clean up memory after unmount (allow some variance)
    expect(memoryLeakage).toBeLessThan(memoryGrowth * 0.1)
  })

  it('handles rapid user interactions without blocking', async () => {
    const user = userEvent.setup()
    const largeForms = generateMockForms(2000)
    
    render(
      <FormsTable
        forms={largeForms}
        loading={false}
        onStatusChange={vi.fn()}
        onViewDetails={vi.fn()}
        onBulkAction={vi.fn()}
      />
    )
    
    const searchInput = screen.getByPlaceholderText(/search forms/i)
    
    const startTime = performance.now()
    
    // Rapid typing simulation
    const searchTerms = ['Customer', 'Customer 1', 'Customer 12', 'Customer 123']
    
    for (const term of searchTerms) {
      await user.clear(searchInput)
      await user.type(searchInput, term)
      
      // Should not block UI
      expect(searchInput).toHaveValue(term)
    }
    
    const endTime = performance.now()
    const rapidInteractionTime = endTime - startTime
    
    // Rapid interactions should not cause significant delays
    expect(rapidInteractionTime).toBeLessThan(2000)
    
    // UI should remain responsive
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('optimizes re-renders with large datasets', async () => {
    const largeForms = generateMockForms(1000)
    let renderCount = 0
    
    const TestWrapper = ({ forms }: { forms: FormSubmission[] }) => {
      renderCount++
      return (
        <FormsTable
          forms={forms}
          loading={false}
          onStatusChange={vi.fn()}
          onViewDetails={vi.fn()}
          onBulkAction={vi.fn()}
        />
      )
    }
    
    const { rerender } = render(<TestWrapper forms={largeForms} />)
    
    const initialRenderCount = renderCount
    
    // Re-render with same data
    rerender(<TestWrapper forms={largeForms} />)
    
    // Should optimize re-renders (memoization)
    expect(renderCount).toBe(initialRenderCount + 1)
    
    // Re-render with modified data
    const modifiedForms = [...largeForms]
    modifiedForms[0] = { ...modifiedForms[0], status: 'completed' }
    
    rerender(<TestWrapper forms={modifiedForms} />)
    
    // Should re-render when data actually changes
    expect(renderCount).toBe(initialRenderCount + 2)
  })
})