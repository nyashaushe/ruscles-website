export interface ContentItem {
  id: string
  type: 'blog_post' | 'testimonial' | 'portfolio_item' | 'page_content'
  title: string
  slug: string
  content: string
  excerpt?: string
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  publishedAt?: Date
  scheduledFor?: Date
  author: string
  tags: string[]
  categories: string[]
  featuredImage?: string
  seoTitle?: string
  seoDescription?: string
  createdAt: Date
  updatedAt: Date
}

export interface BlogPost extends Omit<ContentItem, 'type'> {
  type: 'blog_post'
  readingTime?: number
  viewCount?: number
}

export interface Testimonial {
  id: string
  customerName: string
  customerTitle?: string
  customerCompany?: string
  customerPhoto?: string
  testimonialText: string
  rating?: number
  projectType?: string
  isVisible: boolean
  isFeatured: boolean
  displayOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface PortfolioItem {
  id: string
  title: string
  description: string
  serviceCategory: 'electrical' | 'hvac' | 'refrigeration'
  images: string[]
  thumbnailImage: string
  completionDate: Date
  clientName?: string
  projectValue?: number
  location?: string
  tags: string[]
  isVisible: boolean
  isFeatured: boolean
  displayOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface PageContent {
  id: string
  slug: string
  title: string
  content: string
  metaTitle?: string
  metaDescription?: string
  lastUpdated: Date
  updatedBy: string
}

export interface CreatePortfolioItemData {
  title: string
  description: string
  serviceCategory: 'electrical' | 'hvac' | 'refrigeration'
  images: string[]
  thumbnailImage: string
  completionDate: Date
  clientName?: string
  projectValue?: number
  location?: string
  tags: string[]
  isVisible: boolean
  isFeatured: boolean
}

export interface UpdatePortfolioItemData extends Partial<CreatePortfolioItemData> {
  displayOrder?: number
}

export interface CreateTestimonialData {
  customerName: string
  customerTitle?: string
  customerCompany?: string
  customerPhoto?: string
  testimonialText: string
  rating?: number
  projectType?: string
  isVisible: boolean
  isFeatured: boolean
}

export interface UpdateTestimonialData extends Partial<CreateTestimonialData> {
  displayOrder?: number
}

export interface ContentFilters {
  status?: ContentItem['status'][]
  type?: ContentItem['type'][]
  author?: string
  tags?: string[]
  categories?: string[]
  dateRange?: {
    from: Date
    to: Date
  }
  search?: string
}