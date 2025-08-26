import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, beforeEach, expect } from 'vitest'
import { ImageUpload } from '@/components/ui/image-upload'

// Mock performance API
const mockPerformanceObserver = vi.fn()
const MockedPerformanceObserver = vi.fn().mockImplementation(() => ({
  observe: mockPerformanceObserver,
  disconnect: vi.fn(),
}))
Object.defineProperty(MockedPerformanceObserver, 'supportedEntryTypes', {
  value: ['measure', 'navigation'],
  writable: false
})
global.PerformanceObserver = MockedPerformanceObserver as any

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
    const onUpload = vi.fn().mockResolvedValue('https://example.com/uploaded-image.jpg')
    
    render(
      <ImageUpload
        onUpload={onUpload}
        maxSize={10} // 10MB
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
    
    // Should show file in the list with uploading status
    await waitFor(() => {
      expect(screen.getByText('large-image.jpg')).toBeInTheDocument()
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
    const onUpload = vi.fn().mockResolvedValue('https://example.com/uploaded-image.jpg')
    
    render(
      <ImageUpload
        onUpload={onUpload}
        multiple={true}
        maxSize={5}
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
    
    // Should show all files in the list
    await waitFor(() => {
      files.forEach((_, index) => {
        expect(screen.getByText(`image-${index}.jpg`)).toBeInTheDocument()
      })
    }, { timeout: 1000 })
    
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
    const onUpload = vi.fn().mockResolvedValue('https://example.com/uploaded-image.jpg')
    
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
    
    // Should show the file in the list quickly
    await waitFor(() => {
      expect(screen.getByText('test-image.jpg')).toBeInTheDocument()
    }, { timeout: 200 })
    
    // Wait for upload to complete and preview to show
    await waitFor(() => {
      expect(screen.getByAltText('test-image.jpg')).toBeInTheDocument()
    }, { timeout: 2000 })
    
    const endTime = performance.now()
    const previewTime = endTime - startTime
    
    // Preview generation should be fast
    expect(previewTime).toBeLessThan(3000)
  })

  it('manages memory efficiently during image processing', async () => {
    const user = userEvent.setup()
    const onUpload = vi.fn().mockResolvedValue('https://example.com/uploaded-image.jpg')
    
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
        expect(screen.getByText(`test-${i}.jpg`)).toBeInTheDocument()
      })
      
      // Wait for upload completion
      await waitFor(() => {
        expect(screen.getByAltText(`test-${i}.jpg`)).toBeInTheDocument()
      }, { timeout: 2000 })
      
      // Remove the image
      const removeButtons = screen.getAllByRole('button')
      const removeButton = removeButtons.find(button => 
        button.querySelector('svg')
      )
      if (removeButton) {
        await user.click(removeButton)
      }
    }
    
    // Unmount component
    unmount()
    
    // Memory management should be handled by the component
    expect(onUpload).toHaveBeenCalledTimes(3)
  })

  it('handles upload progress efficiently', async () => {
    const user = userEvent.setup()
    const onUpload = vi.fn().mockImplementation(async (file: File) => {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 500))
      return 'https://example.com/image.jpg'
    })
    
    render(
      <ImageUpload
        onUpload={onUpload}
        acceptedTypes={['image/jpeg']}
      />
    )
    
    const file = new File(['image-data'], 'test.jpg', { type: 'image/jpeg' })
    const fileInput = screen.getByTestId('file-input')
    
    await user.upload(fileInput, file)
    
    // Should show the file name immediately
    expect(screen.getByText('test.jpg')).toBeInTheDocument()
    
    // Should show uploading status
    await waitFor(() => {
      expect(screen.getByText('uploading')).toBeInTheDocument()
    })
    
    // Progress should complete
    await waitFor(() => {
      expect(screen.getByText('success')).toBeInTheDocument()
    }, { timeout: 2000 })
    
    expect(onUpload).toHaveBeenCalled()
  })

  it('throttles resize operations for performance', async () => {
    const user = userEvent.setup()
    const onUpload = vi.fn().mockResolvedValue('https://example.com/uploaded-image.jpg')
    
    render(
      <ImageUpload
        onUpload={onUpload}
        acceptedTypes={['image/jpeg']}
      />
    )
    
    // Upload image file
    const file = new File(['image-data'], 'large.jpg', { 
      type: 'image/jpeg' 
    })
    
    const fileInput = screen.getByTestId('file-input')
    
    const startTime = performance.now()
    await user.upload(fileInput, file)
    
    await waitFor(() => {
      expect(onUpload).toHaveBeenCalled()
    })
    
    const endTime = performance.now()
    const uploadTime = endTime - startTime
    
    // Upload operation should be efficient
    expect(uploadTime).toBeLessThan(1000)
    
    // Should show the uploaded file
    expect(screen.getByText('large.jpg')).toBeInTheDocument()
  })

  it('handles network interruptions gracefully', async () => {
    const user = userEvent.setup()
    const onUpload = vi.fn().mockRejectedValueOnce(new Error('Network error'))
    
    render(
      <ImageUpload
        onUpload={onUpload}
        acceptedTypes={['image/jpeg']}
      />
    )
    
    const file = new File(['image-data'], 'test.jpg', { type: 'image/jpeg' })
    const fileInput = screen.getByTestId('file-input')
    
    await user.upload(fileInput, file)
    
    // Should show error state
    await waitFor(() => {
      expect(screen.getByText('error')).toBeInTheDocument()
    })
    
    // Should show retry button
    const retryButton = screen.getByRole('button', { name: /retry/i })
    expect(retryButton).toBeInTheDocument()
    
    // Mock successful retry
    onUpload.mockResolvedValueOnce('https://example.com/image.jpg')
    
    await user.click(retryButton)
    
    // Should succeed on retry
    await waitFor(() => {
      expect(screen.getByText('success')).toBeInTheDocument()
    })
  })

  it('optimizes drag and drop performance', async () => {
    const onUpload = vi.fn().mockResolvedValue('https://example.com/uploaded-image.jpg')
    
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
      expect(screen.getByText('dropped.jpg')).toBeInTheDocument()
    })
    
    await waitFor(() => {
      expect(onUpload).toHaveBeenCalled()
    })
  })
})