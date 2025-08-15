import { apiClient, PaginatedResponse, ApiResponse } from './client'
import { BlogPost, ContentFilters } from '@/lib/types/content'

export interface BlogPostCreateData {
  title: string
  content: string
  excerpt?: string
  status: 'draft' | 'published' | 'scheduled'
  scheduledFor?: Date
  tags: string[]
  categories: string[]
  featuredImage?: string
  seoTitle?: string
  seoDescription?: string
}

export interface BlogPostUpdateData extends Partial<BlogPostCreateData> {
  id: string
}

export interface BlogPostFilters extends ContentFilters {
  status?: ('draft' | 'published' | 'scheduled' | 'archived')[]
  categories?: string[]
  tags?: string[]
}

export interface BlogPostListParams {
  page?: number
  limit?: number
  search?: string
  filters?: BlogPostFilters
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'title'
  sortOrder?: 'asc' | 'desc'
}

class BlogApi {
  private basePath = '/content/blog'

  async list(params: BlogPostListParams = {}): Promise<PaginatedResponse<BlogPost>> {
    const searchParams = new URLSearchParams()
    
    if (params.page) searchParams.set('page', params.page.toString())
    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.search) searchParams.set('search', params.search)
    if (params.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
    
    if (params.filters) {
      if (params.filters.status?.length) {
        searchParams.set('status', params.filters.status.join(','))
      }
      if (params.filters.categories?.length) {
        searchParams.set('categories', params.filters.categories.join(','))
      }
      if (params.filters.tags?.length) {
        searchParams.set('tags', params.filters.tags.join(','))
      }
      if (params.filters.author) {
        searchParams.set('author', params.filters.author)
      }
      if (params.filters.dateRange) {
        searchParams.set('dateFrom', params.filters.dateRange.from.toISOString())
        searchParams.set('dateTo', params.filters.dateRange.to.toISOString())
      }
    }

    const queryString = searchParams.toString()
    const endpoint = queryString ? `${this.basePath}?${queryString}` : this.basePath
    
    return apiClient.get<PaginatedResponse<BlogPost>>(endpoint)
  }

  async getById(id: string): Promise<ApiResponse<BlogPost>> {
    return apiClient.get<ApiResponse<BlogPost>>(`${this.basePath}/${id}`)
  }

  async create(data: BlogPostCreateData): Promise<ApiResponse<BlogPost>> {
    return apiClient.post<ApiResponse<BlogPost>>(this.basePath, data)
  }

  async update(id: string, data: Partial<BlogPostCreateData>): Promise<ApiResponse<BlogPost>> {
    return apiClient.put<ApiResponse<BlogPost>>(`${this.basePath}/${id}`, data)
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`${this.basePath}/${id}`)
  }

  async publish(id: string): Promise<ApiResponse<BlogPost>> {
    return apiClient.patch<ApiResponse<BlogPost>>(`${this.basePath}/${id}/publish`, {})
  }

  async unpublish(id: string): Promise<ApiResponse<BlogPost>> {
    return apiClient.patch<ApiResponse<BlogPost>>(`${this.basePath}/${id}/unpublish`, {})
  }

  async schedule(id: string, scheduledFor: Date): Promise<ApiResponse<BlogPost>> {
    return apiClient.patch<ApiResponse<BlogPost>>(`${this.basePath}/${id}/schedule`, {
      scheduledFor: scheduledFor.toISOString()
    })
  }

  async saveDraft(id: string, data: Partial<BlogPostCreateData>): Promise<ApiResponse<BlogPost>> {
    return apiClient.patch<ApiResponse<BlogPost>>(`${this.basePath}/${id}/draft`, data)
  }

  async duplicate(id: string): Promise<ApiResponse<BlogPost>> {
    return apiClient.post<ApiResponse<BlogPost>>(`${this.basePath}/${id}/duplicate`, {})
  }

  async getCategories(): Promise<ApiResponse<string[]>> {
    return apiClient.get<ApiResponse<string[]>>(`${this.basePath}/categories`)
  }

  async getTags(): Promise<ApiResponse<string[]>> {
    return apiClient.get<ApiResponse<string[]>>(`${this.basePath}/tags`)
  }

  async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
    return apiClient.uploadFile(`${this.basePath}/upload-image`, file)
  }

  async generateSlug(title: string): Promise<ApiResponse<{ slug: string }>> {
    return apiClient.post<ApiResponse<{ slug: string }>>(`${this.basePath}/generate-slug`, { title })
  }
}

export const blogApi = new BlogApi()