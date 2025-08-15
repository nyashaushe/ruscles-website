import { ContentItem, BlogPost } from '@/lib/types/content'
import { ApprovalRequest, ApprovalStatus } from '@/components/ui/approval-workflow'

export interface ContentVersion {
  id: string
  contentId: string
  version: number
  title: string
  content: string
  status: ContentItem['status']
  createdAt: Date
  createdBy: string
  changeDescription?: string
  isCurrentVersion: boolean
}

export interface ContentWorkflowState {
  requiresApproval: boolean
  approvalRequest?: ApprovalRequest
  canPublish: boolean
  canSchedule: boolean
  canArchive: boolean
  canRestore: boolean
}

export interface PublishOptions {
  publishNow?: boolean
  scheduledFor?: Date
  notifySubscribers?: boolean
  updateSitemap?: boolean
}

export interface ContentDraft {
  id: string
  contentId: string
  title: string
  content: string
  lastSaved: Date
  autoSaved: boolean
}

/**
 * Determines the workflow state for a content item based on its current status and user permissions
 */
export function getContentWorkflowState(
  content: ContentItem,
  userRole: string = 'admin',
  hasApprovalWorkflow: boolean = false
): ContentWorkflowState {
  const isAuthor = content.author === userRole
  const isAdmin = userRole === 'admin' || userRole === 'editor'
  
  const state: ContentWorkflowState = {
    requiresApproval: hasApprovalWorkflow && !isAdmin,
    canPublish: false,
    canSchedule: false,
    canArchive: false,
    canRestore: false,
  }

  switch (content.status) {
    case 'draft':
      state.canPublish = isAdmin || !hasApprovalWorkflow
      state.canSchedule = isAdmin || !hasApprovalWorkflow
      state.canArchive = isAuthor || isAdmin
      break
      
    case 'published':
      state.canSchedule = isAdmin
      state.canArchive = isAuthor || isAdmin
      break
      
    case 'scheduled':
      state.canPublish = isAdmin
      state.canArchive = isAuthor || isAdmin
      break
      
    case 'archived':
      state.canRestore = isAuthor || isAdmin
      break
  }

  return state
}

/**
 * Validates if a content item can transition to a new status
 */
export function canTransitionStatus(
  currentStatus: ContentItem['status'],
  newStatus: ContentItem['status'],
  userRole: string = 'admin'
): boolean {
  const isAdmin = userRole === 'admin' || userRole === 'editor'
  
  const allowedTransitions: Record<ContentItem['status'], ContentItem['status'][]> = {
    draft: ['published', 'scheduled', 'archived'],
    published: ['draft', 'scheduled', 'archived'],
    scheduled: ['draft', 'published', 'archived'],
    archived: ['draft'],
  }

  const allowed = allowedTransitions[currentStatus]?.includes(newStatus) ?? false
  
  // Some transitions require admin privileges
  if (!isAdmin && (newStatus === 'published' || currentStatus === 'published')) {
    return false
  }
  
  return allowed
}

/**
 * Generates a change description for version history
 */
export function generateChangeDescription(
  oldContent: Partial<ContentItem>,
  newContent: Partial<ContentItem>
): string {
  const changes: string[] = []
  
  if (oldContent.title !== newContent.title) {
    changes.push('title updated')
  }
  
  if (oldContent.content !== newContent.content) {
    changes.push('content modified')
  }
  
  if (oldContent.status !== newContent.status) {
    changes.push(`status changed from ${oldContent.status} to ${newContent.status}`)
  }
  
  if (oldContent.scheduledFor !== newContent.scheduledFor) {
    if (newContent.scheduledFor) {
      changes.push('scheduled for publication')
    } else {
      changes.push('scheduling removed')
    }
  }
  
  if (JSON.stringify(oldContent.tags) !== JSON.stringify(newContent.tags)) {
    changes.push('tags updated')
  }
  
  if (JSON.stringify(oldContent.categories) !== JSON.stringify(newContent.categories)) {
    changes.push('categories updated')
  }
  
  return changes.length > 0 ? changes.join(', ') : 'minor updates'
}

/**
 * Calculates reading time for blog posts
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.trim().split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

/**
 * Generates SEO-friendly slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

/**
 * Validates content before publishing
 */
export function validateContentForPublishing(content: ContentItem): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Required fields
  if (!content.title?.trim()) {
    errors.push('Title is required')
  }
  
  if (!content.content?.trim()) {
    errors.push('Content is required')
  }
  
  if (!content.slug?.trim()) {
    errors.push('URL slug is required')
  }
  
  // SEO recommendations
  if (content.title && content.title.length > 60) {
    warnings.push('Title is longer than recommended 60 characters')
  }
  
  if (content.seoDescription && content.seoDescription.length > 160) {
    warnings.push('Meta description is longer than recommended 160 characters')
  }
  
  if (!content.seoDescription) {
    warnings.push('Meta description is missing (recommended for SEO)')
  }
  
  if (!content.featuredImage) {
    warnings.push('Featured image is missing (recommended for social sharing)')
  }
  
  if (content.tags.length === 0) {
    warnings.push('No tags added (recommended for categorization)')
  }
  
  // Content-specific validations
  if (content.type === 'blog_post') {
    const blogPost = content as BlogPost
    if (content.content.length < 300) {
      warnings.push('Blog post content is quite short (less than 300 characters)')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Formats content for different output contexts
 */
export function formatContentForContext(
  content: string,
  context: 'web' | 'email' | 'social' | 'rss'
): string {
  switch (context) {
    case 'web':
      return content // Already formatted for web
      
    case 'email':
      // Strip complex HTML, keep basic formatting
      return content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        
    case 'social':
      // Strip all HTML, create plain text excerpt
      return content
        .replace(/<[^>]*>/g, '')
        .substring(0, 280)
        .trim() + (content.length > 280 ? '...' : '')
        
    case 'rss':
      // Ensure valid XML, escape special characters
      return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        
    default:
      return content
  }
}