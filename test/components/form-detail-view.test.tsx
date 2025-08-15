import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormDetailView } from '@/app/admin/forms/components/form-detail-view'
import { FormSubmission, FormResponse } from '@/lib/types/forms'

const mockForm: FormSubmission = {
  id: '1',
  type: 'contact',
  submittedAt: new Date('2024-01-15T10:00:00Z'),
  status: 'new',
  priority: 'high',
  customerInfo: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-0123',
    company: 'Acme Corp',
  },
  formData: {
    message: 'Need electrical work done urgently',
    service: 'electrical',
    location: '123 Main St',
  },
  responses: [],
  tags: ['electrical', 'urgent'],
  notes: 'Customer called twice',
  lastUpdated: new Date('2024-01-15T10:00:00Z'),
}

const mockResponses: FormResponse[] = [
  {
    id: 'r1',
    formId: '1',
    respondedBy: 'admin@example.com',
    respondedAt: new Date('2024-01-15T11:00:00Z'),
    method: 'email',
    content: 'Thank you for your inquiry. We will contact you soon.',
    attachments: [],
  },
]

const mockProps = {
  form: mockForm,
  responses: mockResponses,
  loading: false,
  onStatusChange: vi.fn(),
  onSendResponse: vi.fn(),
  onAddNote: vi.fn(),
  onUpdateTags: vi.fn(),
}

describe('FormDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form details correctly', () => {
    render(<FormDetailView {...mockProps} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('555-0123')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Need electrical work done urgently')).toBeInTheDocument()
  })

  it('displays form metadata', () => {
    render(<FormDetailView {...mockProps} />)
    
    expect(screen.getByText('Contact Form')).toBeInTheDocument()
    expect(screen.getByText('High Priority')).toBeInTheDocument()
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('shows response history', () => {
    render(<FormDetailView {...mockProps} />)
    
    expect(screen.getByText('Response History')).toBeInTheDocument()
    expect(screen.getByText('Thank you for your inquiry. We will contact you soon.')).toBeInTheDocument()
    expect(screen.getByText('admin@example.com')).toBeInTheDocument()
  })

  it('handles status change', async () => {
    const user = userEvent.setup()
    render(<FormDetailView {...mockProps} />)
    
    const statusSelect = screen.getByRole('combobox', { name: /status/i })
    await user.click(statusSelect)
    
    const inProgressOption = screen.getByText('In Progress')
    await user.click(inProgressOption)
    
    expect(mockProps.onStatusChange).toHaveBeenCalledWith('1', 'in_progress')
  })

  it('handles adding notes', async () => {
    const user = userEvent.setup()
    render(<FormDetailView {...mockProps} />)
    
    const notesTextarea = screen.getByRole('textbox', { name: /notes/i })
    await user.clear(notesTextarea)
    await user.type(notesTextarea, 'Updated notes')
    
    const saveButton = screen.getByRole('button', { name: /save notes/i })
    await user.click(saveButton)
    
    expect(mockProps.onAddNote).toHaveBeenCalledWith('1', 'Updated notes')
  })

  it('handles tag updates', async () => {
    const user = userEvent.setup()
    render(<FormDetailView {...mockProps} />)
    
    const tagInput = screen.getByRole('textbox', { name: /add tag/i })
    await user.type(tagInput, 'priority{enter}')
    
    expect(mockProps.onUpdateTags).toHaveBeenCalledWith('1', ['electrical', 'urgent', 'priority'])
  })

  it('opens response composer', async () => {
    const user = userEvent.setup()
    render(<FormDetailView {...mockProps} />)
    
    const respondButton = screen.getByRole('button', { name: /send response/i })
    await user.click(respondButton)
    
    expect(screen.getByText('Compose Response')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /response content/i })).toBeInTheDocument()
  })

  it('sends response', async () => {
    const user = userEvent.setup()
    render(<FormDetailView {...mockProps} />)
    
    const respondButton = screen.getByRole('button', { name: /send response/i })
    await user.click(respondButton)
    
    const responseTextarea = screen.getByRole('textbox', { name: /response content/i })
    await user.type(responseTextarea, 'Thank you for your inquiry.')
    
    const sendButton = screen.getByRole('button', { name: /send/i })
    await user.click(sendButton)
    
    expect(mockProps.onSendResponse).toHaveBeenCalledWith({
      formId: '1',
      content: 'Thank you for your inquiry.',
      method: 'email',
    })
  })

  it('shows loading state', () => {
    render(<FormDetailView {...mockProps} loading={true} />)
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('displays form data in structured format', () => {
    render(<FormDetailView {...mockProps} />)
    
    expect(screen.getByText('Service Type')).toBeInTheDocument()
    expect(screen.getByText('electrical')).toBeInTheDocument()
    expect(screen.getByText('Location')).toBeInTheDocument()
    expect(screen.getByText('123 Main St')).toBeInTheDocument()
  })

  it('handles empty response history', () => {
    render(<FormDetailView {...mockProps} responses={[]} />)
    
    expect(screen.getByText('No responses yet')).toBeInTheDocument()
  })

  it('is accessible with proper ARIA labels', () => {
    render(<FormDetailView {...mockProps} />)
    
    expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Form details')
    expect(screen.getByRole('region', { name: /customer information/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /response history/i })).toBeInTheDocument()
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<FormDetailView {...mockProps} />)
    
    // Tab through interactive elements
    await user.tab()
    expect(screen.getByRole('combobox', { name: /status/i })).toHaveFocus()
    
    await user.tab()
    expect(screen.getByRole('button', { name: /send response/i })).toHaveFocus()
  })
})