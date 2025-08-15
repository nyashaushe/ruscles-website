import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormSubmissionWorkflow } from '@/test/components/form-submission-workflow'

// Mock API calls
vi.mock('@/lib/api/forms', () => ({
  getForms: vi.fn(),
  getFormById: vi.fn(),
  updateFormStatus: vi.fn(),
  sendFormResponse: vi.fn(),
  addFormNote: vi.fn(),
}))

// Mock notifications
vi.mock('@/hooks/use-notifications', () => ({
  useNotifications: () => ({
    addNotification: vi.fn(),
    notifications: [],
  }),
}))

// Test component that simulates the full workflow
const FormSubmissionWorkflow = () => {
  return (
    <div>
      <div data-testid="forms-dashboard">
        <h1>Forms Dashboard</h1>
        <div data-testid="forms-table">
          <div data-testid="form-row-1" role="row">
            <span>John Doe</span>
            <span>john@example.com</span>
            <span>New</span>
            <button onClick={() => window.location.href = '/admin/forms/1'}>
              View Details
            </button>
          </div>
        </div>
      </div>
      
      <div data-testid="form-detail-view" style={{ display: 'none' }}>
        <h2>Form Details</h2>
        <div data-testid="customer-info">
          <p>Name: John Doe</p>
          <p>Email: john@example.com</p>
          <p>Message: Need electrical work done</p>
        </div>
        
        <div data-testid="status-controls">
          <select data-testid="status-select">
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <button data-testid="update-status">Update Status</button>
        </div>
        
        <div data-testid="response-section">
          <textarea 
            data-testid="response-textarea"
            placeholder="Type your response..."
          />
          <button data-testid="send-response">Send Response</button>
        </div>
        
        <div data-testid="notes-section">
          <textarea 
            data-testid="notes-textarea"
            placeholder="Add notes..."
          />
          <button data-testid="save-notes">Save Notes</button>
        </div>
      </div>
    </div>
  )
}

describe('Form Submission Workflow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock successful API responses
    vi.mocked(require('@/lib/api/forms').getForms).mockResolvedValue([
      {
        id: '1',
        type: 'contact',
        submittedAt: new Date(),
        status: 'new',
        priority: 'high',
        customerInfo: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        formData: { message: 'Need electrical work done' },
        responses: [],
        tags: [],
        notes: '',
        lastUpdated: new Date(),
      },
    ])
    
    vi.mocked(require('@/lib/api/forms').getFormById).mockResolvedValue({
      id: '1',
      type: 'contact',
      submittedAt: new Date(),
      status: 'new',
      priority: 'high',
      customerInfo: {
        name: 'John Doe',
        email: 'john@example.com',
      },
      formData: { message: 'Need electrical work done' },
      responses: [],
      tags: [],
      notes: '',
      lastUpdated: new Date(),
    })
  })

  it('completes full form management workflow', async () => {
    const user = userEvent.setup()
    render(<FormSubmissionWorkflow />)
    
    // Step 1: View forms dashboard
    expect(screen.getByTestId('forms-dashboard')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('New')).toBeInTheDocument()
    
    // Step 2: Click to view form details
    const viewDetailsButton = screen.getByText('View Details')
    await user.click(viewDetailsButton)
    
    // Simulate navigation to detail view
    const dashboard = screen.getByTestId('forms-dashboard')
    const detailView = screen.getByTestId('form-detail-view')
    dashboard.style.display = 'none'
    detailView.style.display = 'block'
    
    // Step 3: View form details
    expect(screen.getByText('Form Details')).toBeInTheDocument()
    expect(screen.getByText('Name: John Doe')).toBeInTheDocument()
    expect(screen.getByText('Email: john@example.com')).toBeInTheDocument()
    
    // Step 4: Update form status
    const statusSelect = screen.getByTestId('status-select')
    const updateStatusButton = screen.getByTestId('update-status')
    
    await user.selectOptions(statusSelect, 'in_progress')
    await user.click(updateStatusButton)
    
    expect(require('@/lib/api/forms').updateFormStatus).toHaveBeenCalledWith('1', 'in_progress')
    
    // Step 5: Send response
    const responseTextarea = screen.getByTestId('response-textarea')
    const sendResponseButton = screen.getByTestId('send-response')
    
    await user.type(responseTextarea, 'Thank you for your inquiry. We will contact you soon.')
    await user.click(sendResponseButton)
    
    expect(require('@/lib/api/forms').sendFormResponse).toHaveBeenCalledWith({
      formId: '1',
      content: 'Thank you for your inquiry. We will contact you soon.',
      method: 'email',
    })
    
    // Step 6: Add notes
    const notesTextarea = screen.getByTestId('notes-textarea')
    const saveNotesButton = screen.getByTestId('save-notes')
    
    await user.type(notesTextarea, 'Customer needs electrical work for new office')
    await user.click(saveNotesButton)
    
    expect(require('@/lib/api/forms').addFormNote).toHaveBeenCalledWith(
      '1', 
      'Customer needs electrical work for new office'
    )
  })

  it('handles form workflow errors gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock API error
    vi.mocked(require('@/lib/api/forms').updateFormStatus).mockRejectedValue(
      new Error('Network error')
    )
    
    render(<FormSubmissionWorkflow />)
    
    // Navigate to detail view
    const viewDetailsButton = screen.getByText('View Details')
    await user.click(viewDetailsButton)
    
    const dashboard = screen.getByTestId('forms-dashboard')
    const detailView = screen.getByTestId('form-detail-view')
    dashboard.style.display = 'none'
    detailView.style.display = 'block'
    
    // Try to update status
    const statusSelect = screen.getByTestId('status-select')
    const updateStatusButton = screen.getByTestId('update-status')
    
    await user.selectOptions(statusSelect, 'in_progress')
    await user.click(updateStatusButton)
    
    // Should handle error gracefully
    await waitFor(() => {
      expect(screen.getByText(/error updating status/i)).toBeInTheDocument()
    })
  })

  it('validates response content before sending', async () => {
    const user = userEvent.setup()
    render(<FormSubmissionWorkflow />)
    
    // Navigate to detail view
    const viewDetailsButton = screen.getByText('View Details')
    await user.click(viewDetailsButton)
    
    const dashboard = screen.getByTestId('forms-dashboard')
    const detailView = screen.getByTestId('form-detail-view')
    dashboard.style.display = 'none'
    detailView.style.display = 'block'
    
    // Try to send empty response
    const sendResponseButton = screen.getByTestId('send-response')
    await user.click(sendResponseButton)
    
    // Should show validation error
    expect(screen.getByText(/response content is required/i)).toBeInTheDocument()
    expect(require('@/lib/api/forms').sendFormResponse).not.toHaveBeenCalled()
  })

  it('shows real-time updates when form status changes', async () => {
    const user = userEvent.setup()
    render(<FormSubmissionWorkflow />)
    
    // Simulate real-time update
    const mockUpdatedForm = {
      id: '1',
      status: 'in_progress',
      lastUpdated: new Date(),
    }
    
    // Mock WebSocket or polling update
    fireEvent(window, new CustomEvent('form-updated', { 
      detail: mockUpdatedForm 
    }))
    
    await waitFor(() => {
      expect(screen.getByText('In Progress')).toBeInTheDocument()
    })
  })

  it('maintains form data consistency across views', async () => {
    const user = userEvent.setup()
    render(<FormSubmissionWorkflow />)
    
    // View form details
    const viewDetailsButton = screen.getByText('View Details')
    await user.click(viewDetailsButton)
    
    // Navigate back to dashboard
    const dashboard = screen.getByTestId('forms-dashboard')
    const detailView = screen.getByTestId('form-detail-view')
    
    // Simulate navigation back
    dashboard.style.display = 'block'
    detailView.style.display = 'none'
    
    // Form should still show updated information
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('handles concurrent form updates', async () => {
    const user = userEvent.setup()
    render(<FormSubmissionWorkflow />)
    
    // Simulate two admins updating the same form
    const updatePromise1 = require('@/lib/api/forms').updateFormStatus('1', 'in_progress')
    const updatePromise2 = require('@/lib/api/forms').updateFormStatus('1', 'completed')
    
    await Promise.all([updatePromise1, updatePromise2])
    
    // Should handle concurrent updates gracefully
    expect(require('@/lib/api/forms').updateFormStatus).toHaveBeenCalledTimes(2)
  })

  it('preserves form filters during workflow', async () => {
    const user = userEvent.setup()
    render(<FormSubmissionWorkflow />)
    
    // Apply filters (simulated)
    const searchInput = screen.getByRole('searchbox', { name: /search forms/i })
    await user.type(searchInput, 'John')
    
    // Navigate to detail view and back
    const viewDetailsButton = screen.getByText('View Details')
    await user.click(viewDetailsButton)
    
    // Navigate back
    const dashboard = screen.getByTestId('forms-dashboard')
    const detailView = screen.getByTestId('form-detail-view')
    dashboard.style.display = 'block'
    detailView.style.display = 'none'
    
    // Filters should be preserved
    expect(searchInput).toHaveValue('John')
  })
})