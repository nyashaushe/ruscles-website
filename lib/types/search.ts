export interface GlobalSearchResult {
  id: string
  type: 'form' | 'blog_post' | 'testimonial' | 'portfolio_item' | 'page_content'
  title: string
  excerpt?: string
  url: string
  status?: string
  priority?: string
  category?: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
  matchedFields: string[]
  relevanceScore: number
}

export interface GlobalSearchFilters {
  types?: GlobalSearchResult['type'][]
  status?: string[]
  priority?: string[]
  categories?: string[]
  tags?: string[]
  dateRange?: {
    from: Date
    to: Date
  }
  author?: string
}

export interface GlobalSearchParams {
  query: string
  filters?: GlobalSearchFilters
  limit?: number
  offset?: number
  sortBy?: 'relevance' | 'date' | 'title'
  sortOrder?: 'asc' | 'desc'
}

export interface SavedSearch {
  id: string
  name: string
  description?: string
  query: string
  filters: GlobalSearchFilters
  isGlobal: boolean
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface FilterPreset {
  id: string
  name: string
  description?: string
  type: 'forms' | 'blog' | 'portfolio' | 'testimonials' | 'global'
  filters: Record<string, any>
  isDefault: boolean
  isShared: boolean
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface AdvancedFilters {
  // Forms specific
  formStatus?: string[]
  formPriority?: string[]
  formType?: string[]
  assignedTo?: string
  
  // Content specific
  contentStatus?: string[]
  contentType?: string[]
  author?: string
  publishedDateRange?: {
    from: Date
    to: Date
  }
  
  // Portfolio specific
  serviceCategory?: string[]
  projectValue?: {
    min?: number
    max?: number
  }
  location?: string
  
  // Testimonial specific
  rating?: {
    min?: number
    max?: number
  }
  projectType?: string[]
  
  // Common filters
  tags?: string[]
  categories?: string[]
  featured?: boolean
  visible?: boolean
  dateRange?: {
    from: Date
    to: Date
  }
  search?: string
}