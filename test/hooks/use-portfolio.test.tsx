import { renderHook, act, waitFor } from '@testing-library/react'
import { usePortfolio } from '@/hooks/use-portfolio'
import { PortfolioItem } from '@/lib/types/content'

// Mock the API
vi.mock('@/lib/api/portfolio', () => ({
  getPortfolioItems: vi.fn(),
  createPortfolioItem: vi.fn(),
  updatePortfolioItem: vi.fn(),
  deletePortfolioItem: vi.fn(),
  reorderPortfolioItems: vi.fn(),
}))

const mockPortfolioItems: PortfolioItem[] = [
  {
    id: '1',
    title: 'Office Electrical Installation',
    description: 'Complete electrical installation for new office building',
    serviceCategory: 'electrical',
    images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    clientName: 'ABC Corporation',
    completionDate: new Date('2024-01-15'),
    isVisible: true,
    isFeatured: true,
    displayOrder: 1,
    createdAt: new Date('2024-01-10T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: '2',
    title: 'Restaurant HVAC System',
    description: 'HVAC system installation and maintenance for restaurant',
    serviceCategory: 'hvac',
    images: ['https://example.com/image3.jpg'],
    clientName: 'Best Eats Restaurant',
    completionDate: new Date('2024-01-10'),
    isVisible: true,
    isFeatured: false,
    displayOrder: 2,
    createdAt: new Date('2024-01-05T10:00:00Z'),
    updatedAt: new Date('2024-01-10T10:00:00Z'),
  },
]

describe('usePortfolio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(require('@/lib/api/portfolio').getPortfolioItems).mockResolvedValue(mockPortfolioItems)
  })

  it('fetches portfolio items on mount', async () => {
    const { result } = renderHook(() => usePortfolio())
    
    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.items).toEqual(mockPortfolioItems)
    expect(require('@/lib/api/portfolio').getPortfolioItems).toHaveBeenCalled()
  })

  it('filters portfolio items by search term', async () => {
    const { result } = renderHook(() => usePortfolio())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    act(() => {
      result.current.setSearchTerm('Office')
    })
    
    expect(result.current.filteredItems).toHaveLength(1)
    expect(result.current.filteredItems[0].title).toBe('Office Electrical Installation')
  })

  it('filters portfolio items by service category', async () => {
    const { result } = renderHook(() => usePortfolio())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    act(() => {
      result.current.setCategoryFilter('electrical')
    })
    
    expect(result.current.filteredItems).toHaveLength(1)
    expect(result.current.filteredItems[0].serviceCategory).toBe('electrical')
  })

  it('filters portfolio items by visibility', async () => {
    const { result } = renderHook(() => usePortfolio())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    act(() => {
      result.current.setVisibilityFilter('featured')
    })
    
    expect(result.current.filteredItems).toHaveLength(1)
    expect(result.current.filteredItems[0].isFeatured).toBe(true)
  })

  it('sorts portfolio items by completion date', async () => {
    const { result } = renderHook(() => usePortfolio())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    act(() => {
      result.current.setSortBy('completionDate')
      result.current.setSortOrder('desc')
    })
    
    expect(result.current.filteredItems[0].id).toBe('1') // More recent completion
  })

  it('creates new portfolio item', async () => {
    const newItem = {
      title: 'Warehouse Refrigeration',
      description: 'Industrial refrigeration system installation',
      serviceCategory: 'refrigeration',
      images: ['https://example.com/image4.jpg'],
      clientName: 'Cold Storage Inc',
      completionDate: new Date('2024-01-20'),
      isVisible: true,
      isFeatured: false,
    }
    
    const createdItem = {
      id: '3',
      ...newItem,
      displayOrder: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    vi.mocked(require('@/lib/api/portfolio').createPortfolioItem).mockResolvedValue(createdItem)
    
    const { result } = renderHook(() => usePortfolio())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    await act(async () => {
      await result.current.createItem(newItem)
    })
    
    expect(require('@/lib/api/portfolio').createPortfolioItem).toHaveBeenCalledWith(newItem)
  })

  it('updates existing portfolio item', async () => {
    const updates = {
      title: 'Updated Office Installation',
      isFeatured: false,
    }
    
    const updatedItem = {
      ...mockPortfolioItems[0],
      ...updates,
      updatedAt: new Date(),
    }
    
    vi.mocked(require('@/lib/api/portfolio').updatePortfolioItem).mockResolvedValue(updatedItem)
    
    const { result } = renderHook(() => usePortfolio())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    await act(async () => {
      await result.current.updateItem('1', updates)
    })
    
    expect(require('@/lib/api/portfolio').updatePortfolioItem).toHaveBeenCalledWith('1', updates)
  })

  it('deletes portfolio item', async () => {
    vi.mocked(require('@/lib/api/portfolio').deletePortfolioItem).mockResolvedValue(undefined)
    
    const { result } = renderHook(() => usePortfolio())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    await act(async () => {
      await result.current.deleteItem('1')
    })
    
    expect(require('@/lib/api/portfolio').deletePortfolioItem).toHaveBeenCalledWith('1')
  })

  it('reorders portfolio items', async () => {
    const newOrder = ['2', '1']
    const reorderedItems = [
      { ...mockPortfolioItems[1], displayOrder: 1 },
      { ...mockPortfolioItems[0], displayOrder: 2 },
    ]
    
    vi.mocked(require('@/lib/api/portfolio').reorderPortfolioItems).mockResolvedValue(reorderedItems)
    
    const { result } = renderHook(() => usePortfolio())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    await act(async () => {
      await result.current.reorderItems(newOrder)
    })
    
    expect(require('@/lib/api/portfolio').reorderPortfolioItems).toHaveBeenCalledWith(newOrder)
  })

  it('handles API errors gracefully', async () => {
    vi.mocked(require('@/lib/api/portfolio').getPortfolioItems).mockRejectedValue(new Error('API Error'))
    
    const { result } = renderHook(() => usePortfolio())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.error).toBe('Failed to fetch portfolio items')
    expect(result.current.items).toEqual([])
  })

  it('provides portfolio statistics', async () => {
    const { result } = renderHook(() => usePortfolio())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.stats).toEqual({
      total: 2,
      visible: 2,
      featured: 1,
      byCategory: {
        electrical: 1,
        hvac: 1,
        refrigeration: 0,
      },
    })
  })

  it('gets unique service categories', async () => {
    const { result } = renderHook(() => usePortfolio())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.categories).toEqual(['electrical', 'hvac'])
  })

  it('filters by date range', async () => {
    const { result } = renderHook(() => usePortfolio())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    act(() => {
      result.current.setDateRange({
        start: new Date('2024-01-12'),
        end: new Date('2024-01-20'),
      })
    })
    
    expect(result.current.filteredItems).toHaveLength(1)
    expect(result.current.filteredItems[0].completionDate).toEqual(new Date('2024-01-15'))
  })

  it('combines multiple filters correctly', async () => {
    const { result } = renderHook(() => usePortfolio())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    act(() => {
      result.current.setSearchTerm('Office')
      result.current.setCategoryFilter('electrical')
      result.current.setVisibilityFilter('featured')
    })
    
    expect(result.current.filteredItems).toHaveLength(1)
    expect(result.current.filteredItems[0].title).toBe('Office Electrical Installation')
    expect(result.current.filteredItems[0].serviceCategory).toBe('electrical')
    expect(result.current.filteredItems[0].isFeatured).toBe(true)
  })

  it('handles image management', async () => {
    const { result } = renderHook(() => usePortfolio())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    const newImages = ['https://example.com/new1.jpg', 'https://example.com/new2.jpg']
    
    await act(async () => {
      await result.current.updateItemImages('1', newImages)
    })
    
    expect(require('@/lib/api/portfolio').updatePortfolioItem).toHaveBeenCalledWith('1', {
      images: newImages,
    })
  })

  it('provides recent items', async () => {
    const { result } = renderHook(() => usePortfolio())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    const recentItems = result.current.getRecentItems(1)
    expect(recentItems).toHaveLength(1)
    expect(recentItems[0].id).toBe('1') // Most recently completed
  })

  it('refreshes portfolio data', async () => {
    const { result } = renderHook(() => usePortfolio())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    vi.clearAllMocks()
    
    await act(async () => {
      await result.current.refresh()
    })
    
    expect(require('@/lib/api/portfolio').getPortfolioItems).toHaveBeenCalled()
  })
})