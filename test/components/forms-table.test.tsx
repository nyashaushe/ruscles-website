import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormsTable } from '@/app/admin/forms/components/forms-table'
import { FormSubmission } from '@/lib/types/forms'

const mockForms: FormSubmission[] = [
  {
    id: '1',
    type: 'contact',
    submittedAt: new Date('2024-01-15T10:00:00Z'),
    status: 'new',
    priority: 'high',
    customerInfo: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-0123',
    },
    formData: {
      message: 'Need electrical work done',
      service: 'electrical',
    },
    responses: [],
    tags: ['electrical'],
    notes: '',
    lastUpdated: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: '2',
    type: 'service_inquiry',
    submittedAt: new Date('2024-01-14T15:30:00Z'),
    status: 'in_progress',
    priority: 'medium',
    customerInfo: {
      name: 'Jane Smith',
      email: 'jane@example.com',
    },
    formData: {
      message: 'HVAC maintenance needed',
      service: 'hvac',
    },
    responses: [],
    tags: ['hvac'],
    notes: 'Called customer',
    lastUpdated: new Date('2024-01-14T16:00:00Z'),
  },
]

const mockProps = {
  forms: mockForms,
  loading: false,
  onStatusChange: vi.fn(),
  onViewDetails: vi.fn(),
  onBulkAction: vi.fn(),
}

describe('FormsTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders forms table with correct data', () => {
    render(<FormsTable {...mockProps} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    expect(screen.getByText('Need electrical work done')).toBeInTheDocument()
  })

  it('displays correct status badges', () => {
    render(<FormsTable {...mockProps} />)
    
    expect(screen.getByText('New')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  it('displays correct priority indicators', () => {
    render(<FormsTable {...mockProps} />)
    
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('handles status change', async () => {
    const user = userEvent.setup()
    render(<FormsTable {...mockProps} />)
    
    const statusButton = screen.getAllByRole('button', { name: /change status/i })[0]
    await user.click(statusButton)
    
    const completedOption = screen.getByText('Completed')
    await user.click(completedOption)
    
    expect(mockProps.onStatusChange).toHaveBeenCalledWith('1', 'completed')
  })

  it('handles view details click', async () => {
    const user = userEvent.setup()
    render(<FormsTable {...mockProps} />)
    
    const viewButton = screen.getAllByRole('button', { name: /view details/i })[0]
    await user.click(viewButton)
    
    expect(mockProps.onViewDetails).toHaveBeenCalledWith('1')
  })

  it('filters forms by search term', async () => {
    const user = userEvent.setup()
    render(<FormsTable {...mockProps} />)
    
    const searchInput = screen.getByPlaceholderText(/search forms/i)
    await user.type(searchInput, 'John')
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    })
  })

  it('sorts forms by date', async () => {
    const user = userEvent.setup()
    render(<FormsTable {...mockProps} />)
    
    const dateHeader = screen.getByText('Submitted')
    await user.click(dateHeader)
    
    // Check that forms are reordered (newest first after click)
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('John Doe') // More recent submission
  })

  it('handles bulk actions', async () => {
    const user = userEvent.setup()
    render(<FormsTable {...mockProps} />)
    
    // Select multiple forms
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1]) // First form checkbox
    await user.click(checkboxes[2]) // Second form checkbox
    
    const bulkActionButton = screen.getByText('Bulk Actions')
    await user.click(bulkActionButton)
    
    const markAsReadOption = screen.getByText('Mark as Read')
    await user.click(markAsReadOption)
    
    expect(mockProps.onBulkAction).toHaveBeenCalledWith('mark_read', ['1', '2'])
  })

  it('shows loading state', () => {
    render(<FormsTable {...mockProps} loading={true} />)
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('shows empty state when no forms', () => {
    render(<FormsTable {...mockProps} forms={[]} />)
    
    expect(screen.getByText('No forms found')).toBeInTheDocument()
  })

  it('is accessible with keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<FormsTable {...mockProps} />)
    
    // Tab through interactive elements
    await user.tab()
    expect(screen.getByPlaceholderText(/search forms/i)).toHaveFocus()
    
    await user.tab()
    expect(screen.getByRole('button', { name: /filter/i })).toHaveFocus()
  })

  it('has proper ARIA labels', () => {
    render(<FormsTable {...mockProps} />)
    
    expect(screen.getByRole('table')).toHaveAttribute('aria-label', 'Forms submissions table')
    expect(screen.getByRole('searchbox')).toHaveAttribute('aria-label', 'Search forms')
  })
})