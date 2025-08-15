import { renderHook, act, waitFor } from '@testing-library/react'
import { useTestimonials } from '@/hooks/use-testimonials'
import { Testimonial } from '@/lib/types/content'
import { it } from 'date-fns/locale'
import { beforeEach } from 'node:test'
import { describe } from 'node:test'
import { vi } from 'date-fns/locale'

// Mock the API
vi.mock('@/lib/api/testimonials', () => ({
  getTestimonials: vi.fn(),
  createTestimonial: vi.fn(),
  updateTestimonial: vi.fn(),
  deleteTestimonial: vi.fn(),
  reorderTestimonials: vi.fn(),
}))

const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    customerName: 'John Smith',
    customerCompany: 'Smith Industries',
    testimonialText: 'Excellent electrical work! Professional and timely service.',
    projectType: 'electrical',
    customerPhoto: 'https://example.com/photo1.jpg',
    isVisible: true,
    isFeatured: true,
    displayOrder: 1,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: '2',
    customerName: 'Jane Doe',
    customerCompany: 'Doe Corp',
    testimonialText: 'Outstanding HVAC service. Highly recommend!',
    projectType: 'hvac',
    customerPhoto: 'https://example.com/photo2.jpg',
    isVisible: true,
    isFeatured: false,
    displayOrder: 2,
    createdAt: new Date('2024-01-14T10:00:00Z'),
    updatedAt: new Date('2024-01-14T10:00:00Z'),
  },
]

describe('useTestimonials', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(require('@/lib/api/testimonials').getTestimonials).mockResolvedValue(mockTestimonials)
  })

  it('fetches testimonials on mount', async () => {
    const { result } = renderHook(() => useTestimonials())
    
    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.testimonials).toEqual(mockTestimonials)
    expect(require('@/lib/api/testimonials').getTestimonials).toHaveBeenCalled()
  })

  it('filters testimonials by search term', async () => {
    const { result } = renderHook(() => useTestimonials())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    act(() => {
      result.current.setSearchTerm('John')
    })
    
    expect(result.current.filteredTestimonials).toHaveLength(1)
    expect(result.current.filteredTestimonials[0].customerName).toBe('John Smith')
  })

  it('filters testimonials by project type', async () => {
    const { result } = renderHook(() => useTestimonials())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    act(() => {
      result.current.setProjectTypeFilter('electrical')
    })
    
    expect(result.current.filteredTestimonials).toHaveLength(1)
    expect(result.current.filteredTestimonials[0].projectType).toBe('electrical')
  })

  it('filters testimonials by visibility', async () => {
    const { result } = renderHook(() => useTestimonials())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    act(() => {
      result.current.setVisibilityFilter('featured')
    })
    
    expect(result.current.filteredTestimonials).toHaveLength(1)
    expect(result.current.filteredTestimonials[0].isFeatured).toBe(true)
  })

  it('creates new testimonial', async () => {
    const newTestimonial = {
      customerName: 'Bob Wilson',
      customerCompany: 'Wilson LLC',
      testimonialText: 'Great refrigeration service!',
      projectType: 'refrigeration',
      customerPhoto: 'https://example.com/photo3.jpg',
      isVisible: true,
      isFeatured: false,
    }
    
    const createdTestimonial = {
      id: '3',
      ...newTestimonial,
      displayOrder: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    vi.mocked(require('@/lib/api/testimonials').createTestimonial).mockResolvedValue(createdTestimonial)
    
    const { result } = renderHook(() => useTestimonials())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    await act(async () => {
      await result.current.createTestimonial(newTestimonial)
    })
    
    expect(require('@/lib/api/testimonials').createTestimonial).toHaveBeenCalledWith(newTestimonial)
  })

  it('updates existing testimonial', async () => {
    const updates = {
      testimonialText: 'Updated testimonial text',
      isFeatured: true,
    }
    
    const updatedTestimonial = {
      ...mockTestimonials[0],
      ...updates,
      updatedAt: new Date(),
    }
    
    vi.mocked(require('@/lib/api/testimonials').updateTestimonial).mockResolvedValue(updatedTestimonial)
    
    const { result } = renderHook(() => useTestimonials())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    await act(async () => {
      await result.current.updateTestimonial('1', updates)
    })
    
    expect(require('@/lib/api/testimonials').updateTestimonial).toHaveBeenCalledWith('1', updates)
  })

  it('deletes testimonial', async () => {
    vi.mocked(require('@/lib/api/testimonials').deleteTestimonial).mockResolvedValue(undefined)
    
    const { result } = renderHook(() => useTestimonials())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    await act(async () => {
      await result.current.deleteTestimonial('1')
    })
    
    expect(require('@/lib/api/testimonials').deleteTestimonial).toHaveBeenCalledWith('1')
  })

  it('reorders testimonials', async () => {
    const newOrder = ['2', '1']
    const reorderedTestimonials = [
      { ...mockTestimonials[1], displayOrder: 1 },
      { ...mockTestimonials[0], displayOrder: 2 },
    ]
    
    vi.mocked(require('@/lib/api/testimonials').reorderTestimonials).mockResolvedValue(reorderedTestimonials)
    
    const { result } = renderHook(() => useTestimonials())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    await act(async () => {
      await result.current.reorderTestimonials(newOrder)
    })
    
    expect(require('@/lib/api/testimonials').reorderTestimonials).toHaveBeenCalledWith(newOrder)
  })

  it('handles API errors gracefully', async () => {
    vi.mocked(require('@/lib/api/testimonials').getTestimonials).mockRejectedValue(new Error('API Error'))
    
    const { result } = renderHook(() => useTestimonials())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.error).toBe('Failed to fetch testimonials')
    expect(result.current.testimonials).toEqual([])
  })

  it('provides testimonial statistics', async () => {
    const { result } = renderHook(() => useTestimonials())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.stats).toEqual({
      total: 2,
      visible: 2,
      featured: 1,
      byProjectType: {
        electrical: 1,
        hvac: 1,
        refrigeration: 0,
      },
    })
  })

  it('gets unique project types', async () => {
    const { result } = renderHook(() => useTestimonials())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.projectTypes).toEqual(['electrical', 'hvac'])
  })

  it('combines multiple filters correctly', async () => {
    const { result } = renderHook(() => useTestimonials())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    act(() => {
      result.current.setSearchTerm('John')
      result.current.setProjectTypeFilter('electrical')
      result.current.setVisibilityFilter('featured')
    })
    
    expect(result.current.filteredTestimonials).toHaveLength(1)
    expect(result.current.filteredTestimonials[0].customerName).toBe('John Smith')
    expect(result.current.filteredTestimonials[0].projectType).toBe('electrical')
    expect(result.current.filteredTestimonials[0].isFeatured).toBe(true)
  })

  it('sorts testimonials by display order', async () => {
    const { result } = renderHook(() => useTestimonials())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    act(() => {
      result.current.setSortBy('displayOrder')
      result.current.setSortOrder('asc')
    })
    
    expect(result.current.filteredTestimonials[0].displayOrder).toBe(1)
    expect(result.current.filteredTestimonials[1].displayOrder).toBe(2)
  })
})