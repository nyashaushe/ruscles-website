import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImageUpload } from '@/components/ui/image-upload'

// Mock performance API
const mockPerformanceObserver = vi.fn()
global.PerformanceObserver = vi.fn().mockImplementation(() => ({
  observe: mockPerformanceObserver,
  disconnect: vi.fn(),
}))

// Mock fetch for upload simulation
global.fetch = vi.fn()

describe('Image Upload Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock successful upload response
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: 'https://example.com/uploaded-image.jpg' }),
    } as Response)
  })

  it('handles large image files efficiently', async () => {
    const user = userEvent.setup()
    const onUpload = vi.fn()
    
    render(
      <ImageUpload
        onUpload={onUpload}
        maxSize={10 * 1024 * 1024} // 10MB
        acceptedTypes={['image/jpeg', 'image/png']}
      />
    )
    
    // Create large image file (5MB)
    const largeImageData = new Array(5 * 1024 * 1024).fill('x').join('')
    const largeFile = new File([largeImageData], 'large-image.jpg', { 
      type: 'image/jpeg' 
    })
    
    const fileInput = screen.getByTestId('file-input')
    
    const startTime = performance.now()
    await user.upload(fileInput, largeFile)
    
    // Should show progress indicator quickly
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    }, { timeout: 100 })
    
    // Wait for upload completion
    await waitFor(() => {
      expect(onUpload).toHaveBeenCalled()
    }, { timeout: 5000 })
    
    const endTime = performance.now()
    const uploadTime = endTime - startTime
    
    // Large file upload should complete within reasonable time
    expect(uploadTime).toBeLessThan(5000)
  })

  it('handles multiple concurrent uploads efficiently', async () => {
    const user = userEvent.setup()
    const onUpload = vi.fn()
    
    render(
      <ImageUpload
        onUpload={onUpload}
        multiple={true}
        maxSize={5 * 1024 * 1024}
        acceptedTypes={['image/jpeg', 'image/png']}
      />
    )
    
    // Create multiple files
    const files = Array.from({ length: 5 }, (_, index) => 
      new File([`image-data-${index}`], `image-${index}.jpg`, { 
        type: 'image/jpeg' 
      })
    )
    
    const fileInput = screen.getByTestId('file-input')
    
    const startTime = performance.now()
    await user.upload(fileInput, files)
    
    // Should handle all uploads
    await waitFor(() => {
      expect(onUpload).toHaveBeenCalledTimes(5)
    }, { timeout: 3000 })
    
    const endTime = performance.now()
    const totalUploadTime = endTime - startTime
    
    // Multiple uploads should be efficient (parallel processing)
    expect(totalUploadTime).toBeLessThan(3000)
  })

  it('optimizes image preview generation', async () => {
    const user = userEvent.setup()
    const onUpload = vi.fn()
    
    // Mock URL.createObjectURL to measure calls
    const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
    global.URL.createObjectURL = mockCreateObjectURL
    
    render(
      <ImageUpload
        onUpload={onUpload}
        showPreview={true}
        acceptedTypes={['image/jpeg', 'image/png']}
      />
    )
    
    const file = new File(['image-data'], 'test-image.jpg', { 
      type: 'image/jpeg' 
    })
    
    const fileInput = screen.getByTestId('file-input')
    
    const startTime = performance.now()
    await user.upload(fileInput, file)
    
    // Should generate preview quickly
    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    }, { timeout: 200 })
    
    const endTime = performance.now()
    const previewTime = endTime - startTime
    
    // Preview generation should be fast
    expect(previewTime).toBeLessThan(200)
    
    // Should only create one object URL per file
    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1)
  })

  it('manages memory efficiently during image processing', async () => {
    const user = userEvent.setup()
    const onUpload = vi.fn()
    
    // Track object URL creation and cleanup
    const createdUrls: string[] = []
    const revokedUrls: string[] = []
    
    global.URL.createObjectURL = vi.fn((blob) => {
      const url = `blob:mock-url-${createdUrls.length}`
      createdUrls.push(url)
      return url
    })
    
    global.URL.revokeObjectURL = vi.fn((url) => {
      revokedUrls.push(url)
    })
    
    const { unmount } = render(
      <ImageUpload
        onUpload={onUpload}
        showPreview={true}
        acceptedTypes={['image/jpeg']}
      />
    )
    
    // Upload and remove multiple images
    const fileInput = screen.getByTestId('file-input')
    
    for (let i = 0; i < 3; i++) {
      const file = new File([`image-data-${i}`], `test-${i}.jpg`, { 
        type: 'image/jpeg' 
      })
      
      await user.upload(fileInput, file)
      
      await waitFor(() => {
        expect(screen.getByAltText('Preview')).toBeInTheDocument()
      })
      
      // Remove the image
      const removeButton = screen.getByRole('button', { name: /remove/i })
      await user.click(removeButton)
    }
    
    // Unmount component
    unmount()
    
    // Should clean up all object URLs
    expect(createdUrls.length).toBe(3)
    expect(revokedUrls.length).toBe(3)
    
    // All created URLs should be revoked
    createdUrls.forEach(url => {
      expect(revokedUrls).toContain(url)
    })
  })

  it('handles upload progress efficiently', async () => {
    const user = userEvent.setup()
    const onUpload = vi.fn()
    
    // Mock fetch with progress simulation
    let progressCallback: ((progress: number) => void) | null = null
    
    vi.mocked(fetch).mockImplementation(() => {
      return new Promise((resolve) => {
        // Simulate progress updates
        let progress = 0
        const interval = setInterval(() => {
          progress += 20
          if (progressCallback) {
            progressCallback(progress)
          }
          
          if (progress >= 100) {
            clearInterval(interval)
            resolve({
              ok: true,
              json: () => Promise.resolve({ url: 'https://example.com/image.jpg' }),
            } as Response)
          }
        }, 50)
      })
    })
    
    render(
      <ImageUpload
        onUpload={onUpload}
        showProgress={true}
        acceptedTypes={['image/jpeg']}
      />
    )
    
    const file = new File(['image-data'], 'test.jpg', { type: 'image/jpeg' })
    const fileInput = screen.getByTestId('file-input')
    
    await user.upload(fileInput, file)
    
    // Should show progress bar
    const progressBar = await screen.findByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
    
    // Progress should update smoothly
    await waitFor(() => {
      expect(onUpload).toHaveBeenCalled()
    }, { timeout: 1000 })
    
    // Progress bar should disappear after completion
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('throttles resize operations for performance', async () => {
    const user = userEvent.setup()
    const onUpload = vi.fn()
    
    // Mock canvas operations
    const mockCanvas = {
      getContext: vi.fn(() => ({
        drawImage: vi.fn(),
        getImageData: vi.fn(),
        putImageData: vi.fn(),
      })),
      toBlob: vi.fn((callback) => {
        callback(new Blob(['resized-image'], { type: 'image/jpeg' }))
      }),
      width: 0,
      height: 0,
    }
    
    global.HTMLCanvasElement.prototype.getContext = mockCanvas.getContext
    global.HTMLCanvasElement.prototype.toBlob = mockCanvas.toBlob
    
    render(
      <ImageUpload
        onUpload={onUpload}
        enableResize={true}
        maxWidth={800}
        maxHeight={600}
        acceptedTypes={['image/jpeg']}
      />
    )
    
    // Upload large image that needs resizing
    const largeFile = new File(['large-image-data'], 'large.jpg', { 
      type: 'image/jpeg' 
    })
    
    const fileInput = screen.getByTestId('file-input')
    
    const startTime = performance.now()
    await user.upload(fileInput, largeFile)
    
    await waitFor(() => {
      expect(onUpload).toHaveBeenCalled()
    })
    
    const endTime = performance.now()
    const resizeTime = endTime - startTime
    
    // Resize operation should be efficient
    expect(resizeTime).toBeLessThan(1000)
    
    // Canvas operations should be called for resizing
    expect(mockCanvas.getContext).toHaveBeenCalled()
    expect(mockCanvas.toBlob).toHaveBeenCalled()
  })

  it('handles network interruptions gracefully', async () => {
    const user = userEvent.setup()
    const onUpload = vi.fn()
    const onError = vi.fn()
    
    // Mock network failure
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))
    
    render(
      <ImageUpload
        onUpload={onUpload}
        onError={onError}
        retryAttempts={2}
        acceptedTypes={['image/jpeg']}
      />
    )
    
    const file = new File(['image-data'], 'test.jpg', { type: 'image/jpeg' })
    const fileInput = screen.getByTestId('file-input')
    
    await user.upload(fileInput, file)
    
    // Should show error state
    await waitFor(() => {
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument()
    })
    
    // Should show retry button
    const retryButton = screen.getByRole('button', { name: /retry/i })
    expect(retryButton).toBeInTheDocument()
    
    // Mock successful retry
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ url: 'https://example.com/image.jpg' }),
    } as Response)
    
    await user.click(retryButton)
    
    // Should succeed on retry
    await waitFor(() => {
      expect(onUpload).toHaveBeenCalled()
    })
  })

  it('optimizes drag and drop performance', async () => {
    const onUpload = vi.fn()
    
    render(
      <ImageUpload
        onUpload={onUpload}
        acceptedTypes={['image/jpeg', 'image/png']}
      />
    )
    
    const dropZone = screen.getByTestId('drop-zone')
    
    // Simulate rapid drag events
    const startTime = performance.now()
    
    for (let i = 0; i < 10; i++) {
      fireEvent.dragEnter(dropZone)
      fireEvent.dragOver(dropZone)
      fireEvent.dragLeave(dropZone)
    }
    
    const endTime = performance.now()
    const dragTime = endTime - startTime
    
    // Drag operations should be smooth
    expect(dragTime).toBeLessThan(100)
    
    // Final drop with file
    const file = new File(['image-data'], 'dropped.jpg', { type: 'image/jpeg' })
    
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] }
    })
    
    await waitFor(() => {
      expect(onUpload).toHaveBeenCalled()
    })
  })
})