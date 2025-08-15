import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContentPublishingWorkflow } from '@/test/components/content-publishing-workflow'

// Mock API calls
vi.mock('@/lib/api/blog', () => ({
  createBlogPost: vi.fn(),
  updateBlogPost: vi.fn(),
  publishBlogPost: vi.fn(),
  scheduleBlogPost: vi.fn(),
}))

vi.mock('@/lib/api/testimonials', () => ({
  createTestimonial: vi.fn(),
  updateTestimonial: vi.fn(),
}))

vi.mock('@/lib/api/portfolio', () => ({
  createPortfolioItem: vi.fn(),
  updatePortfolioItem: vi.fn(),
}))

// Test component that simulates content creation workflow
const ContentPublishingWorkflow = () => {
  const [currentView, setCurrentView] = React.useState('dashboard')
  const [contentType, setContentType] = React.useState('')
  
  return (
    <div>
      {currentView === 'dashboard' && (
        <div data-testid="content-dashboard">
          <h1>Content Management</h1>
          <div data-testid="content-types">
            <button 
              onClick={() => {
                setContentType('blog')
                setCurrentView('create')
              }}
              data-testid="create-blog-post"
            >
              Create Blog Post
            </button>
            <button 
              onClick={() => {
                setContentType('testimonial')
                setCurrentView('create')
              }}
              data-testid="create-testimonial"
            >
              Add Testimonial
            </button>
            <button 
              onClick={() => {
                setContentType('portfolio')
                setCurrentView('create')
              }}
              data-testid="create-portfolio"
            >
              Add Portfolio Item
            </button>
          </div>
        </div>
      )}
      
      {currentView === 'create' && contentType === 'blog' && (
        <div data-testid="blog-editor">
          <h2>Create Blog Post</h2>
          <form data-testid="blog-form">
            <input 
              data-testid="blog-title"
              placeholder="Post title"
              required
            />
            <textarea 
              data-testid="blog-content"
              placeholder="Post content"
              required
            />
            <input 
              data-testid="blog-excerpt"
              placeholder="Post excerpt"
            />
            <input 
              data-testid="blog-tags"
              placeholder="Tags (comma separated)"
            />
            <select data-testid="blog-category">
              <option value="">Select category</option>
              <option value="tips">Tips</option>
              <option value="guides">Guides</option>
              <option value="news">News</option>
            </select>
            
            <div data-testid="seo-fields">
              <input 
                data-testid="seo-title"
                placeholder="SEO Title"
              />
              <textarea 
                data-testid="seo-description"
                placeholder="SEO Description"
              />
            </div>
            
            <div data-testid="publishing-controls">
              <button type="button" data-testid="save-draft">
                Save Draft
              </button>
              <button type="button" data-testid="publish-now">
                Publish Now
              </button>
              <button type="button" data-testid="schedule-publish">
                Schedule
              </button>
            </div>
          </form>
        </div>
      )}
      
      {currentView === 'create' && contentType === 'testimonial' && (
        <div data-testid="testimonial-editor">
          <h2>Add Testimonial</h2>
          <form data-testid="testimonial-form">
            <input 
              data-testid="customer-name"
              placeholder="Customer name"
              required
            />
            <input 
              data-testid="customer-company"
              placeholder="Company (optional)"
            />
            <textarea 
              data-testid="testimonial-text"
              placeholder="Testimonial text"
              required
            />
            <input 
              type="file"
              data-testid="customer-photo"
              accept="image/*"
            />
            <select data-testid="project-type">
              <option value="">Select project type</option>
              <option value="electrical">Electrical</option>
              <option value="hvac">HVAC</option>
              <option value="refrigeration">Refrigeration</option>
            </select>
            
            <div data-testid="visibility-controls">
              <label>
                <input type="checkbox" data-testid="is-visible" />
                Show on website
              </label>
              <label>
                <input type="checkbox" data-testid="is-featured" />
                Featured testimonial
              </label>
            </div>
            
            <button type="submit" data-testid="save-testimonial">
              Save Testimonial
            </button>
          </form>
        </div>
      )}
      
      {currentView === 'create' && contentType === 'portfolio' && (
        <div data-testid="portfolio-editor">
          <h2>Add Portfolio Item</h2>
          <form data-testid="portfolio-form">
            <input 
              data-testid="project-title"
              placeholder="Project title"
              required
            />
            <textarea 
              data-testid="project-description"
              placeholder="Project description"
              required
            />
            <select data-testid="service-category" required>
              <option value="">Select service</option>
              <option value="electrical">Electrical</option>
              <option value="hvac">HVAC</option>
              <option value="refrigeration">Refrigeration</option>
            </select>
            
            <div data-testid="image-upload-section">
              <input 
                type="file"
                data-testid="project-images"
                accept="image/*"
                multiple
              />
              <div data-testid="image-previews"></div>
            </div>
            
            <input 
              data-testid="client-name"
              placeholder="Client name (optional)"
            />
            <input 
              type="date"
              data-testid="completion-date"
              required
            />
            
            <div data-testid="visibility-controls">
              <label>
                <input type="checkbox" data-testid="is-visible" />
                Show on website
              </label>
              <label>
                <input type="checkbox" data-testid="is-featured" />
                Featured project
              </label>
            </div>
            
            <button type="submit" data-testid="save-portfolio">
              Save Portfolio Item
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

describe('Content Publishing E2E Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('completes blog post creation and publishing workflow', async () => {
    const user = userEvent.setup()
    
    // Mock successful API responses
    vi.mocked(require('@/lib/api/blog').createBlogPost).mockResolvedValue({
      id: '1',
      title: 'Test Blog Post',
      slug: 'test-blog-post',
      status: 'draft',
    })
    
    vi.mocked(require('@/lib/api/blog').publishBlogPost).mockResolvedValue({
      id: '1',
      status: 'published',
      publishedAt: new Date(),
    })
    
    render(<ContentPublishingWorkflow />)
    
    // Step 1: Navigate to blog creation
    expect(screen.getByTestId('content-dashboard')).toBeInTheDocument()
    
    const createBlogButton = screen.getByTestId('create-blog-post')
    await user.click(createBlogButton)
    
    // Step 2: Fill out blog post form
    expect(screen.getByTestId('blog-editor')).toBeInTheDocument()
    
    await user.type(screen.getByTestId('blog-title'), 'Electrical Safety Tips for Homeowners')
    await user.type(screen.getByTestId('blog-content'), 'Safety is paramount when dealing with electrical systems...')
    await user.type(screen.getByTestId('blog-excerpt'), 'Learn essential electrical safety tips')
    await user.type(screen.getByTestId('blog-tags'), 'electrical, safety, homeowners')
    await user.selectOptions(screen.getByTestId('blog-category'), 'tips')
    
    // Step 3: Fill SEO fields
    await user.type(screen.getByTestId('seo-title'), 'Electrical Safety Tips - Expert Guide')
    await user.type(screen.getByTestId('seo-description'), 'Learn essential electrical safety tips from certified professionals')
    
    // Step 4: Save as draft first
    const saveDraftButton = screen.getByTestId('save-draft')
    await user.click(saveDraftButton)
    
    expect(require('@/lib/api/blog').createBlogPost).toHaveBeenCalledWith({
      title: 'Electrical Safety Tips for Homeowners',
      content: 'Safety is paramount when dealing with electrical systems...',
      excerpt: 'Learn essential electrical safety tips',
      tags: ['electrical', 'safety', 'homeowners'],
      categories: ['tips'],
      seoTitle: 'Electrical Safety Tips - Expert Guide',
      seoDescription: 'Learn essential electrical safety tips from certified professionals',
      status: 'draft',
    })
    
    // Step 5: Publish the post
    const publishButton = screen.getByTestId('publish-now')
    await user.click(publishButton)
    
    expect(require('@/lib/api/blog').publishBlogPost).toHaveBeenCalledWith('1')
  })

  it('creates testimonial with image upload', async () => {
    const user = userEvent.setup()
    
    vi.mocked(require('@/lib/api/testimonials').createTestimonial).mockResolvedValue({
      id: '1',
      customerName: 'John Smith',
      testimonialText: 'Excellent service!',
    })
    
    render(<ContentPublishingWorkflow />)
    
    // Navigate to testimonial creation
    const createTestimonialButton = screen.getByTestId('create-testimonial')
    await user.click(createTestimonialButton)
    
    // Fill testimonial form
    await user.type(screen.getByTestId('customer-name'), 'John Smith')
    await user.type(screen.getByTestId('customer-company'), 'Smith Industries')
    await user.type(screen.getByTestId('testimonial-text'), 'Excellent electrical work! Professional and timely service.')
    await user.selectOptions(screen.getByTestId('project-type'), 'electrical')
    
    // Upload customer photo
    const photoInput = screen.getByTestId('customer-photo')
    const file = new File(['photo'], 'customer.jpg', { type: 'image/jpeg' })
    await user.upload(photoInput, file)
    
    // Set visibility options
    await user.click(screen.getByTestId('is-visible'))
    await user.click(screen.getByTestId('is-featured'))
    
    // Save testimonial
    const saveButton = screen.getByTestId('save-testimonial')
    await user.click(saveButton)
    
    expect(require('@/lib/api/testimonials').createTestimonial).toHaveBeenCalledWith({
      customerName: 'John Smith',
      customerCompany: 'Smith Industries',
      testimonialText: 'Excellent electrical work! Professional and timely service.',
      projectType: 'electrical',
      customerPhoto: expect.any(String),
      isVisible: true,
      isFeatured: true,
    })
  })

  it('creates portfolio item with multiple images', async () => {
    const user = userEvent.setup()
    
    vi.mocked(require('@/lib/api/portfolio').createPortfolioItem).mockResolvedValue({
      id: '1',
      title: 'Office Electrical Installation',
      serviceCategory: 'electrical',
    })
    
    render(<ContentPublishingWorkflow />)
    
    // Navigate to portfolio creation
    const createPortfolioButton = screen.getByTestId('create-portfolio')
    await user.click(createPortfolioButton)
    
    // Fill portfolio form
    await user.type(screen.getByTestId('project-title'), 'Office Electrical Installation')
    await user.type(screen.getByTestId('project-description'), 'Complete electrical installation for new office building')
    await user.selectOptions(screen.getByTestId('service-category'), 'electrical')
    await user.type(screen.getByTestId('client-name'), 'ABC Corporation')
    await user.type(screen.getByTestId('completion-date'), '2024-01-15')
    
    // Upload multiple project images
    const imageInput = screen.getByTestId('project-images')
    const files = [
      new File(['image1'], 'before.jpg', { type: 'image/jpeg' }),
      new File(['image2'], 'after.jpg', { type: 'image/jpeg' }),
      new File(['image3'], 'detail.jpg', { type: 'image/jpeg' }),
    ]
    await user.upload(imageInput, files)
    
    // Set visibility
    await user.click(screen.getByTestId('is-visible'))
    await user.click(screen.getByTestId('is-featured'))
    
    // Save portfolio item
    const saveButton = screen.getByTestId('save-portfolio')
    await user.click(saveButton)
    
    expect(require('@/lib/api/portfolio').createPortfolioItem).toHaveBeenCalledWith({
      title: 'Office Electrical Installation',
      description: 'Complete electrical installation for new office building',
      serviceCategory: 'electrical',
      clientName: 'ABC Corporation',
      completionDate: new Date('2024-01-15'),
      images: expect.arrayContaining([
        expect.stringContaining('before.jpg'),
        expect.stringContaining('after.jpg'),
        expect.stringContaining('detail.jpg'),
      ]),
      isVisible: true,
      isFeatured: true,
    })
  })

  it('handles content creation errors gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock API error
    vi.mocked(require('@/lib/api/blog').createBlogPost).mockRejectedValue(
      new Error('Server error')
    )
    
    render(<ContentPublishingWorkflow />)
    
    // Try to create blog post
    const createBlogButton = screen.getByTestId('create-blog-post')
    await user.click(createBlogButton)
    
    await user.type(screen.getByTestId('blog-title'), 'Test Post')
    await user.type(screen.getByTestId('blog-content'), 'Test content')
    
    const saveDraftButton = screen.getByTestId('save-draft')
    await user.click(saveDraftButton)
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/error creating blog post/i)).toBeInTheDocument()
    })
  })

  it('validates required fields before submission', async () => {
    const user = userEvent.setup()
    render(<ContentPublishingWorkflow />)
    
    // Try to create blog post without required fields
    const createBlogButton = screen.getByTestId('create-blog-post')
    await user.click(createBlogButton)
    
    const saveDraftButton = screen.getByTestId('save-draft')
    await user.click(saveDraftButton)
    
    // Should show validation errors
    expect(screen.getByText(/title is required/i)).toBeInTheDocument()
    expect(screen.getByText(/content is required/i)).toBeInTheDocument()
    
    // API should not be called
    expect(require('@/lib/api/blog').createBlogPost).not.toHaveBeenCalled()
  })

  it('schedules blog post for future publication', async () => {
    const user = userEvent.setup()
    
    vi.mocked(require('@/lib/api/blog').createBlogPost).mockResolvedValue({
      id: '1',
      title: 'Scheduled Post',
      status: 'draft',
    })
    
    vi.mocked(require('@/lib/api/blog').scheduleBlogPost).mockResolvedValue({
      id: '1',
      status: 'scheduled',
      scheduledFor: new Date('2024-02-01T10:00:00Z'),
    })
    
    render(<ContentPublishingWorkflow />)
    
    // Create blog post
    const createBlogButton = screen.getByTestId('create-blog-post')
    await user.click(createBlogButton)
    
    await user.type(screen.getByTestId('blog-title'), 'Future Post')
    await user.type(screen.getByTestId('blog-content'), 'This will be published later')
    
    // Save as draft first
    const saveDraftButton = screen.getByTestId('save-draft')
    await user.click(saveDraftButton)
    
    // Schedule for publication
    const scheduleButton = screen.getByTestId('schedule-publish')
    await user.click(scheduleButton)
    
    // Mock date picker interaction
    const dateInput = screen.getByTestId('schedule-date')
    await user.type(dateInput, '2024-02-01T10:00')
    
    const confirmScheduleButton = screen.getByTestId('confirm-schedule')
    await user.click(confirmScheduleButton)
    
    expect(require('@/lib/api/blog').scheduleBlogPost).toHaveBeenCalledWith(
      '1',
      new Date('2024-02-01T10:00:00Z')
    )
  })

  it('auto-saves content during editing', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup()
    
    vi.mocked(require('@/lib/api/blog').updateBlogPost).mockResolvedValue({
      id: '1',
      title: 'Auto-saved Post',
    })
    
    render(<ContentPublishingWorkflow />)
    
    // Start creating blog post
    const createBlogButton = screen.getByTestId('create-blog-post')
    await user.click(createBlogButton)
    
    // Type content
    await user.type(screen.getByTestId('blog-title'), 'Auto-saved Post')
    await user.type(screen.getByTestId('blog-content'), 'This content will be auto-saved')
    
    // Fast-forward 30 seconds (auto-save interval)
    act(() => {
      vi.advanceTimersByTime(30000)
    })
    
    // Should auto-save
    await waitFor(() => {
      expect(require('@/lib/api/blog').updateBlogPost).toHaveBeenCalled()
    })
    
    vi.useRealTimers()
  })
})