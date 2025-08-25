import { useState, useEffect, useCallback } from 'react'

export interface BlogPost {
  id: string
  type: 'BLOG_POST'
  title: string
  slug: string
  content: string
  excerpt?: string
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED'
  publishedAt?: string
  scheduledFor?: string
  author: string
  tags: string[]
  categories: string[]
  featuredImage?: string
  seoTitle?: string
  seoDescription?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name?: string
    email?: string
  }
  blogPost: {
    readingTime?: number
    viewCount: number
  }
}

export interface BlogFilters {
  search?: string
  status?: string
  page?: number
  limit?: number
}

export interface BlogStats {
  total: number
  published: number
  draft: number
  scheduled: number
  archived: number
}

export interface BlogResponse {
  blogPosts: BlogPost[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export function useBlog() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })
  const [stats, setStats] = useState<BlogStats>({
    total: 0,
    published: 0,
    draft: 0,
    scheduled: 0,
    archived: 0,
  })

  // Fetch blog posts with filters
  const fetchBlogPosts = useCallback(async (filters: BlogFilters = {}) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.status && filters.status !== 'all') params.append('status', filters.status)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())

      const response = await fetch(`/api/content/blog?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch blog posts')
      }

      const data: BlogResponse = await response.json()
      setBlogPosts(data.blogPosts)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch blog stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/content/blog/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to fetch blog stats:', err)
    }
  }, [])

  // Create a new blog post
  const createBlogPost = useCallback(async (blogData: Partial<BlogPost>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/content/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create blog post')
      }

      const newBlogPost = await response.json()
      setBlogPosts(prev => [newBlogPost, ...prev])
      return newBlogPost
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create blog post')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update a blog post
  const updateBlogPost = useCallback(async (id: string, blogData: Partial<BlogPost>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/content/blog/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update blog post')
      }

      const updatedBlogPost = await response.json()
      setBlogPosts(prev => prev.map(p => p.id === id ? updatedBlogPost : p))
      return updatedBlogPost
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update blog post')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete a blog post
  const deleteBlogPost = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/content/blog/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete blog post')
      }

      setBlogPosts(prev => prev.filter(p => p.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete blog post')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get a single blog post
  const getBlogPost = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/content/blog/${id}`)

      if (!response.ok) {
        throw new Error('Failed to fetch blog post')
      }

      const blogPost = await response.json()
      return blogPost
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blog post')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Refresh blog posts
  const refresh = useCallback(() => {
    fetchBlogPosts()
    fetchStats()
  }, [fetchBlogPosts, fetchStats])

  // Initial load
  useEffect(() => {
    fetchBlogPosts()
    fetchStats()
  }, [fetchBlogPosts, fetchStats])

  return {
    blogPosts,
    loading,
    error,
    pagination,
    stats,
    fetchBlogPosts,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    getBlogPost,
    refresh,
  }
}