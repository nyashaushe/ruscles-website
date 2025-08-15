export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx'
  dateRange?: {
    from: Date
    to: Date
  }
  includeResponses?: boolean
  includeMetadata?: boolean
}

export interface FormExportData {
  id: string
  type: string
  submittedAt: string
  status: string
  priority: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerCompany?: string
  assignedTo?: string
  tags: string
  notes: string
  lastUpdated: string
  responseCount: number
  firstResponseAt?: string
  lastResponseAt?: string
  formData: Record<string, any>
}

export interface ContentExportData {
  id: string
  type: string
  title: string
  slug: string
  status: string
  author: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
  tags: string
  categories: string
  viewCount?: number
  engagementScore?: number
}

export interface ReportMetrics {
  totalForms: number
  formsByStatus: Record<string, number>
  formsByType: Record<string, number>
  formsByPriority: Record<string, number>
  averageResponseTime: number
  responseRate: number
  trendsData: {
    date: string
    submissions: number
    responses: number
  }[]
}

export interface ContentAnalytics {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalViews: number
  averageViews: number
  topPerformingPosts: {
    id: string
    title: string
    views: number
    publishedAt: string
  }[]
  contentTrends: {
    date: string
    posts: number
    views: number
  }[]
}

export interface ExportJob {
  id: string
  type: 'forms' | 'content' | 'analytics'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  createdAt: Date
  completedAt?: Date
  downloadUrl?: string
  error?: string
  options: ExportOptions
}

export interface ScheduledReport {
  id: string
  name: string
  type: 'forms' | 'content' | 'analytics'
  frequency: 'daily' | 'weekly' | 'monthly'
  recipients: string[]
  options: ExportOptions
  isActive: boolean
  lastRun?: Date
  nextRun: Date
  createdAt: Date
}