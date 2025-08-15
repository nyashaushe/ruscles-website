import { renderHook, act, waitFor } from '@testing-library/react'
import { useBlog } from '@/hooks/use-blog'
import { BlogPost } from '@/lib/types/content'

// Mock the API
vi.mock('@/lib/api/blog', () => ({
  getBlogPosts: vi.fn(),
  createBlogPost: vi.fn(),
  updateBlogPost: vi.fn(),
  deleteBlogPost: vi.fn(),
  publishBlogPost: vi.fn(),
  scheduleBlogPost: vi.fn(),
}))

const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Electrical Safety Tips',
    slug: 'electrical-safety-tips',
    content: '<p>Safety first when dealing with electricity...</p>',
    excerpt: 'Learn essential electrical safety tips',
    status: 'published',
    publishedAt: new Date('2024-01-15T10:00:00Z'),
    author: 'admin@example.com',
    tags: ['electrical', 'safety'],
    categories: ['tips'],
    featuredImage: 'https://example.com/image1.jpg',
    seoTitle: 'Electrical Safety Tips - Expert Guide',
    seoDescription: 'Learn essential electrical safety tips from professionals',
    createdAt: new Date('2024-01-14T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: '2',
    title: 'HVAC Maintenance Guide',
    slug: 'hvac-maintenance-guide',
    content: '<p>Regular maintenance keeps your HVAC system running...</p>',
    excerpt: 'Complete guide to HVAC maintenance',
    status: 'draft',
    author: 'admin@example.com',
    tags: ['hvac', 'maintenance'],
    categories: ['guides'],
    createdAt: new Date('2024-01-13T10:00:00Z'),
    updatedAt: new Date('2024-01-13T10:00:00Z'),
  },
]

describe('useBlog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(require('@/lib/api/blog').getBlogPosts).mockResolvedValue(mockBlogPosts)
  })

  it('fetches blog posts on mount', async () => {
    const { result } = renderHook(() => useBlog())
    
    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.posts).toEqual(mockBlogPosts)
    expect(require('@/lib/api/blog').getBlogPosts).toHaveBeenCalled()
  })

  it('filters posts by search term', async () => {
    const { result } = renderHook(() => useBlog())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    act(() => {
      result.current.setSearchTerm('Electrical')
    })
    
    expect(result.current.filteredPosts).toHaveLength(1)
    expect(result.current.filteredPosts[0].title).toBe('Electrical Safety Tips')
  })

  it('filters posts by status', async () => {
    const { result } = renderHook(() => useBlog())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    act(() => {
      result.current.setStatusFilter('published')
    })
    
    expect(result.current.filteredPosts).toHaveLength(1)
    expect(result.current.filteredPosts[0].status).toBe('published')
  })

  it('filters posts by category', async () => {
    const { result } = renderHook(() => useBlog())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    act(() => {
      result.current.setCategoryFilter('tips')
    })
    
    expect(result.current.filteredPosts).toHaveLength(1)
    expect(result.current.filteredPosts[0].categories).toContain('tips')
  })

  it('sorts posts by date', async () => {
    const { result } = renderHook(() => useBlog())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    act(() => {
      result.current.setSortBy('publishedAt')
      result.current.setSortOrder('desc')
    })
    
    expect(result.current.filteredPosts[0].id).toBe('1') // More recent
  })

  it('creates new blog post', async () => {
    const newPost = {
      title: 'New Post',
      content: '<p>New content</p>',
      excerpt: 'New excerpt',
      tags: ['new'],
      categories: ['updates'],
    }
    
    const createdPost = {
      id: '3',
      ...newPost,
      slug: 'new-post',
      status: 'draft' as const,
      author: 'admin@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    vi.mocked(require('@/lib/api/blog').createBlogPost).mockResolvedValue(createdPost)
    
    const { result } = renderHook(() => useBlog())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    await act(async () => {
      await result.current.createPost(newPost)
    })
    
    expect(require('@/lib/api/blog').createBlogPost).toHaveBeenCalledWith(newPost)
  })

  it('updates existing blog post', async () => {
    const updates = {
      title: 'Updated Title',
      content: '<p>Updated content</p>',
    }
    
    const updatedPost = {
      ...mockBlogPosts[0],
      ...updates,
      updatedAt: new Date(),
    }
    
    vi.mocked(require('@/lib/api/blog').updateBlogPost).mockResolvedValue(updatedPost)
    
    const { result } = renderHook(() => useBlog())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    await act(async () => {
      await result.current.updatePost('1', updates)
    })
    
    expect(require('@/lib/api/blog').updateBlogPost).toHaveBeenCalledWith('1', updates)
  })

  it('deletes blog post', async () => {
    vi.mocked(require('@/lib/api/blog').deleteBlogPost).mockResolvedValue(undefined)
    
    const { result } = renderHook(() => useBlog())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    await act(async () => {
      await result.current.deletePost('1')
    })
    
    expect(require('@/lib/api/blog').deleteBlogPost).toHaveBeenCalledWith('1')
  })

  it('publishes blog post', async () => {
    const publishedPost = {
      ...mockBlogPosts[1],
      status: 'published' as const,
      publishedAt: new Date(),
    }
    
    vi.mocked(require('@/lib/api/blog').publishBlogPost).mockResolvedValue(publishedPost)
    
    const { result } = renderHook(() => useBlog())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    await act(async () => {
      await result.current.publishPost('2')
    })
    
    expect(require('@/lib/api/blog').publishBlogPost).toHaveBeenCalledWith('2')
  })

  it('schedules blog post', async () => {
    const scheduleDate = new Date('2024-02-01T10:00:00Z')
    const scheduledPost = {
      ...mockBlogPosts[1],
      status: 'scheduled' as const,
      scheduledFor: scheduleDate,
    }
    
    vi.mocked(require('@/lib/api/blog').scheduleBlogPost).mockResolvedValue(scheduledPost)
    
    const { result } = renderHook(() => useBlog())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    await act(async () => {
      await result.current.schedulePost('2', scheduleDate)
    })
    
    expect(require('@/lib/api/blog').scheduleBlogPost).toHaveBeenCalledWith('2', scheduleDate)
  })

  it('handles API errors gracefully', async () => {
    vi.mocked(require('@/lib/api/blog').getBlogPosts).mockRejectedValue(new Error('API Error'))
    
    const { result } = renderHook(() => useBlog())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.error).toBe('Failed to fetch blog posts')
    expect(result.current.posts).toEqual([])
  })

  it('provides blog statistics', async () => {
    const { result } = renderHook(() => useBlog())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.stats).toEqual({
      total: 2,
      published: 1,
      draft: 1,
      scheduled: 0,
    })
  })

  it('gets unique categories and tags', async () => {
    const { result } = renderHook(() => useBlog())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.categories).toEqual(['tips', 'guides'])
    expect(result.current.tags).toEqual(['electrical', 'safety', 'hvac', 'maintenance'])
  })

  it('auto-saves draft posts', async () => {
    vi.useFakeTimers()
    
    const { result } = renderHook(() => useBlog())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    act(() => {
      result.current.setAutoSaveContent('1', '<p>Auto-saved content</p>')
    })
    
    // Fast-forward 30 seconds (auto-save interval)
    act(() => {
      vi.advanceTimersByTime(30000)
    })
    
    await waitFor(() => {
      expect(require('@/lib/api/blog').updateBlogPost).toHaveBeenCalledWith('1', {
        content: '<p>Auto-saved content</p>',
      })
    })
    
    vi.useRealTimers()
  })

  it('combines multiple filters correctly', async () => {
    const { result } = renderHook(() => useBlog())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    act(() => {
      result.current.setSearchTerm('Safety')
      result.current.setStatusFilter('published')
      result.current.setCategoryFilter('tips')
    })
    
    expect(result.current.filteredPosts).toHaveLength(1)
    expect(result.current.filteredPosts[0].title).toBe('Electrical Safety Tips')
  })
})