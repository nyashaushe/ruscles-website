import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImageUpload } from '@/components/ui/image-upload'

const mockProps = {
  onUpload: vi.fn(),
  maxSize: 5 * 1024 * 1024, // 5MB
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  multiple: false,
}

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock fetch for upload
global.fetch = vi.fn()

describe('ImageUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: 'https://example.com/image.jpg' }),
    } as Response)
  })

  it('renders upload area', () => {
    render(<ImageUpload {...mockProps} />)
    
    expect(screen.getByText('Drop images here or click to browse')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /browse files/i })).toBeInTheDocument()
  })

  it('handles file selection via input', async () => {
    const user = userEvent.setup()
    render(<ImageUpload {...mockProps} />)
    
    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('file-input')
    
    await user.upload(input, file)
    
    await waitFor(() => {
      expect(mockProps.onUpload).toHaveBeenCalledWith('https://example.com/image.jpg')
    })
  })

  it('handles drag and drop', async () => {
    render(<ImageUpload {...mockProps} />)
    
    const dropZone = screen.getByTestId('drop-zone')
    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
    
    fireEvent.dragEnter(dropZone, {
      dataTransfer: { files: [file] }
    })
    
    expect(dropZone).toHaveClass('border-primary')
    
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] }
    })
    
    await waitFor(() => {
      expect(mockProps.onUpload).toHaveBeenCalledWith('https://example.com/image.jpg')
    })
  })

  it('shows preview after file selection', async () => {
    const user = userEvent.setup()
    render(<ImageUpload {...mockProps} />)
    
    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('file-input')
    
    await user.upload(input, file)
    
    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
      expect(screen.getByText('test.jpg')).toBeInTheDocument()
    })
  })

  it('shows upload progress', async () => {
    const user = userEvent.setup()
    
    // Mock fetch to simulate slow upload
    vi.mocked(fetch).mockImplementation(() => 
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({ url: 'https://example.com/image.jpg' }),
          } as Response)
        }, 100)
      })
    )
    
    render(<ImageUpload {...mockProps} />)
    
    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('file-input')
    
    await user.upload(input, file)
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })
  })

  it('validates file size', async () => {
    const user = userEvent.setup()
    render(<ImageUpload {...mockProps} maxSize={1024} />) // 1KB limit
    
    const largeFile = new File(['x'.repeat(2048)], 'large.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('file-input')
    
    await user.upload(input, largeFile)
    
    expect(screen.getByText(/file size exceeds limit/i)).toBeInTheDocument()
    expect(mockProps.onUpload).not.toHaveBeenCalled()
  })

  it('validates file type', async () => {
    const user = userEvent.setup()
    render(<ImageUpload {...mockProps} />)
    
    const invalidFile = new File(['content'], 'document.pdf', { type: 'application/pdf' })
    const input = screen.getByTestId('file-input')
    
    await user.upload(input, invalidFile)
    
    expect(screen.getByText(/invalid file type/i)).toBeInTheDocument()
    expect(mockProps.onUpload).not.toHaveBeenCalled()
  })

  it('handles multiple file uploads', async () => {
    const user = userEvent.setup()
    render(<ImageUpload {...mockProps} multiple={true} />)
    
    const files = [
      new File(['image1'], 'test1.jpg', { type: 'image/jpeg' }),
      new File(['image2'], 'test2.jpg', { type: 'image/jpeg' }),
    ]
    const input = screen.getByTestId('file-input')
    
    await user.upload(input, files)
    
    await waitFor(() => {
      expect(mockProps.onUpload).toHaveBeenCalledTimes(2)
    })
  })

  it('handles upload errors', async () => {
    const user = userEvent.setup()
    
    vi.mocked(fetch).mockRejectedValue(new Error('Upload failed'))
    
    render(<ImageUpload {...mockProps} />)
    
    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('file-input')
    
    await user.upload(input, file)
    
    await waitFor(() => {
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument()
    })
  })

  it('allows removing uploaded images', async () => {
    const user = userEvent.setup()
    render(<ImageUpload {...mockProps} />)
    
    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('file-input')
    
    await user.upload(input, file)
    
    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })
    
    const removeButton = screen.getByRole('button', { name: /remove/i })
    await user.click(removeButton)
    
    expect(screen.queryByAltText('Preview')).not.toBeInTheDocument()
  })

  it('supports image cropping', async () => {
    const user = userEvent.setup()
    render(<ImageUpload {...mockProps} enableCropping={true} />)
    
    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('file-input')
    
    await user.upload(input, file)
    
    await waitFor(() => {
      expect(screen.getByText('Crop Image')).toBeInTheDocument()
    })
    
    const cropButton = screen.getByRole('button', { name: /crop/i })
    await user.click(cropButton)
    
    expect(screen.getByTestId('image-cropper')).toBeInTheDocument()
  })

  it('is accessible with proper ARIA labels', () => {
    render(<ImageUpload {...mockProps} />)
    
    expect(screen.getByTestId('drop-zone')).toHaveAttribute('role', 'button')
    expect(screen.getByTestId('drop-zone')).toHaveAttribute('aria-label', 'Upload images')
    expect(screen.getByTestId('file-input')).toHaveAttribute('aria-describedby')
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<ImageUpload {...mockProps} />)
    
    const dropZone = screen.getByTestId('drop-zone')
    
    await user.tab()
    expect(dropZone).toHaveFocus()
    
    await user.keyboard('{Enter}')
    // Should trigger file input click
    expect(screen.getByTestId('file-input')).toBeInTheDocument()
  })

  it('shows file format hints', () => {
    render(<ImageUpload {...mockProps} />)
    
    expect(screen.getByText(/supported formats/i)).toBeInTheDocument()
    expect(screen.getByText(/jpeg, png, webp/i)).toBeInTheDocument()
  })

  it('handles paste events', async () => {
    render(<ImageUpload {...mockProps} />)
    
    const dropZone = screen.getByTestId('drop-zone')
    
    // Mock clipboard data
    const clipboardData = {
      files: [new File(['image'], 'pasted.jpg', { type: 'image/jpeg' })]
    }
    
    fireEvent.paste(dropZone, { clipboardData })
    
    await waitFor(() => {
      expect(mockProps.onUpload).toHaveBeenCalledWith('https://example.com/image.jpg')
    })
  })
})