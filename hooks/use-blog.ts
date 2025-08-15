import { useState, useEffect, useCallback } from 'react'
import { blogApi, BlogPostListParams, BlogPostCreateData, BlogPostUpdateData } from '@/lib/api/blog'
import { BlogPost } from '@/lib/types/content'
import { useToast } from './use-toast'

export interface UseBlogListResult {
  posts: BlogPost[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  refresh: () => Promise<void>
  loadMore: () => Promise<void>
  hasMore: boolean
}

export function useBlogList(params: BlogPostListParams = {}) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const { toast } = useToast()

  const fetchPosts = useCallback(async (resetList = false) => {
    try {
      setLoading(true)
      setError(null)
      
      const currentPage = resetList ? 1 : pagination.page
      const response = await blogApi.list({
        ...params,
        page: currentPage,
        limit: params.limit || 10
      })

      if (response.success) {
        if (resetList) {
          setPosts(response.data)
        } else {
          setPosts(prev => [...prev, ...response.data])
        }
        setPagination(response.pagination)
      } else {
        throw new Error('Failed to fetch blog posts')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch blog posts'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [params, pagination.page, toast])

  const refresh = useCallback(async () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    await fetchPosts(true)
  }, [fetchPosts])

  const loadMore = useCallback(async () => {
    if (pagination.page < pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }))
      await fetchPosts(false)
    }
  }, [fetchPosts, pagination.page, pagination.totalPages])

  useEffect(() => {
    fetchPosts(true)
  }, [params.search, params.filters, params.sortBy, params.sortOrder])

  return {
    posts,
    loading,
    error,
    pagination,
    refresh,
    loadMore,
    hasMore: pagination.page < pagination.totalPages
  }
}

export interface UseBlogPostResult {
  post: BlogPost | null
  loading: boolean
  error: string | null
  create: (data: BlogPostCreateData) => Promise<BlogPost | null>
  update: (id: string, data: Partial<BlogPostCreateData>) => Promise<BlogPost | null>
  delete: (id: string) => Promise<boolean>
  publish: (id: string) => Promise<BlogPost | null>
  unpublish: (id: string) => Promise<BlogPost | null>
  schedule: (id: string, scheduledFor: Date) => Promise<BlogPost | null>
  saveDraft: (id: string, data: Partial<BlogPostCreateData>) => Promise<BlogPost | null>
  duplicate: (id: string) => Promise<BlogPost | null>
}

export function useBlogPost(id?: string): UseBlogPostResult {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchPost = useCallback(async (postId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await blogApi.getById(postId)
      if (response.success) {
        setPost(response.data)
      } else {
        throw new Error('Failed to fetch blog post')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch blog post'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const create = useCallback(async (data: BlogPostCreateData): Promise<BlogPost | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await blogApi.create(data)
      if (response.success) {
        setPost(response.data)
        toast({
          title: "Success",
          description: "Blog post created successfully"
        })
        return response.data
      } else {
        throw new Error(response.message || 'Failed to create blog post')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create blog post'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [toast])

  const update = useCallback(async (postId: string, data: Partial<BlogPostCreateData>): Promise<BlogPost | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await blogApi.update(postId, data)
      if (response.success) {
        setPost(response.data)
        toast({
          title: "Success",
          description: "Blog post updated successfully"
        })
        return response.data
      } else {
        throw new Error(response.message || 'Failed to update blog post')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update blog post'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [toast])

  const deleteBlogPost = useCallback(async (postId: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await blogApi.delete(postId)
      if (response.success) {
        setPost(null)
        toast({
          title: "Success",
          description: "Blog post deleted successfully"
        })
        return true
      } else {
        throw new Error(response.message || 'Failed to delete blog post')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete blog post'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [toast])

  const publish = useCallback(async (postId: string): Promise<BlogPost | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await blogApi.publish(postId)
      if (response.success) {
        setPost(response.data)
        toast({
          title: "Success",
          description: "Blog post published successfully"
        })
        return response.data
      } else {
        throw new Error(response.message || 'Failed to publish blog post')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish blog post'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [toast])

  const unpublish = useCallback(async (postId: string): Promise<BlogPost | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await blogApi.unpublish(postId)
      if (response.success) {
        setPost(response.data)
        toast({
          title: "Success",
          description: "Blog post unpublished successfully"
        })
        return response.data
      } else {
        throw new Error(response.message || 'Failed to unpublish blog post')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unpublish blog post'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [toast])

  const schedule = useCallback(async (postId: string, scheduledFor: Date): Promise<BlogPost | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await blogApi.schedule(postId, scheduledFor)
      if (response.success) {
        setPost(response.data)
        toast({
          title: "Success",
          description: `Blog post scheduled for ${scheduledFor.toLocaleDateString()}`
        })
        return response.data
      } else {
        throw new Error(response.message || 'Failed to schedule blog post')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule blog post'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [toast])

  const saveDraft = useCallback(async (postId: string, data: Partial<BlogPostCreateData>): Promise<BlogPost | null> => {
    try {
      setError(null)
      
      const response = await blogApi.saveDraft(postId, data)
      if (response.success) {
        setPost(response.data)
        return response.data
      } else {
        throw new Error(response.message || 'Failed to save draft')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save draft'
      setError(errorMessage)
      return null
    }
  }, [])

  const duplicate = useCallback(async (postId: string): Promise<BlogPost | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await blogApi.duplicate(postId)
      if (response.success) {
        toast({
          title: "Success",
          description: "Blog post duplicated successfully"
        })
        return response.data
      } else {
        throw new Error(response.message || 'Failed to duplicate blog post')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate blog post'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (id) {
      fetchPost(id)
    }
  }, [id, fetchPost])

  return {
    post,
    loading,
    error,
    create,
    update,
    delete: deleteBlogPost,
    publish,
    unpublish,
    schedule,
    saveDraft,
    duplicate
  }
}

export function useBlogCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await blogApi.getCategories()
        if (response.success) {
          setCategories(response.data)
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch categories",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [toast])

  return { categories, loading }
}

export function useBlogTags() {
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await blogApi.getTags()
        if (response.success) {
          setTags(response.data)
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch tags",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [toast])

  return { tags, loading }
}