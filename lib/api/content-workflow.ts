import { apiClient, ApiResponse, PaginatedResponse } from './client'
import { ContentItem } from '@/lib/types/content'
import { ContentVersion, ContentDraft, PublishOptions } from '@/lib/utils/content-workflow'
import { ApprovalRequest } from '@/components/ui/approval-workflow'

export interface ContentWorkflowAPI {
  // Version management
  getVersionHistory: (contentId: string) => Promise<ContentVersion[]>
  createVersion: (contentId: string, changeDescription?: string) => Promise<ContentVersion>
  restoreVersion: (contentId: string, versionId: string) => Promise<ContentItem>
  
  // Draft management
  saveDraft: (contentId: string, data: Partial<ContentItem>) => Promise<ContentDraft>
  getDraft: (contentId: string) => Promise<ContentDraft | null>
  deleteDraft: (contentId: string) => Promise<void>
  
  // Publishing workflow
  publishContent: (contentId: string, options?: PublishOptions) => Promise<ContentItem>
  scheduleContent: (contentId: string, scheduledFor: Date, options?: PublishOptions) => Promise<ContentItem>
  unpublishContent: (contentId: string) => Promise<ContentItem>
  archiveContent: (contentId: string) => Promise<ContentItem>
  restoreContent: (contentId: string) => Promise<ContentItem>
  
  // Approval workflow
  requestApproval: (contentId: string, message?: string) => Promise<ApprovalRequest>
  getApprovalRequests: (filters?: ApprovalFilters) => Promise<PaginatedResponse<ApprovalRequest>>
  approveContent: (requestId: string, comment?: string) => Promise<ApprovalRequest>
  rejectContent: (requestId: string, comment: string) => Promise<ApprovalRequest>
  requestChanges: (requestId: string, comment: string) => Promise<ApprovalRequest>
}

export interface ApprovalFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'changes_requested'
  contentType?: 'blog_post' | 'testimonial' | 'portfolio_item' | 'page_content'
  requestedBy?: string
  reviewedBy?: string
  dateRange?: {
    from: Date
    to: Date
  }
}

class ContentWorkflowService implements ContentWorkflowAPI {
  // Version management
  async getVersionHistory(contentId: string): Promise<ContentVersion[]> {
    const response = await apiClient.get<ApiResponse<ContentVersion[]>>(
      `/content/${contentId}/versions`
    )
    return response.data
  }

  async createVersion(contentId: string, changeDescription?: string): Promise<ContentVersion> {
    const response = await apiClient.post<ApiResponse<ContentVersion>>(
      `/content/${contentId}/versions`,
      { changeDescription }
    )
    return response.data
  }

  async restoreVersion(contentId: string, versionId: string): Promise<ContentItem> {
    const response = await apiClient.post<ApiResponse<ContentItem>>(
      `/content/${contentId}/versions/${versionId}/restore`,
      {}
    )
    return response.data
  }

  // Draft management
  async saveDraft(contentId: string, data: Partial<ContentItem>): Promise<ContentDraft> {
    const response = await apiClient.put<ApiResponse<ContentDraft>>(
      `/content/${contentId}/draft`,
      data
    )
    return response.data
  }

  async getDraft(contentId: string): Promise<ContentDraft | null> {
    try {
      const response = await apiClient.get<ApiResponse<ContentDraft>>(
        `/content/${contentId}/draft`
      )
      return response.data
    } catch (error) {
      // Return null if draft doesn't exist
      return null
    }
  }

  async deleteDraft(contentId: string): Promise<void> {
    await apiClient.delete(`/content/${contentId}/draft`)
  }

  // Publishing workflow
  async publishContent(contentId: string, options: PublishOptions = {}): Promise<ContentItem> {
    const response = await apiClient.post<ApiResponse<ContentItem>>(
      `/content/${contentId}/publish`,
      options
    )
    return response.data
  }

  async scheduleContent(contentId: string, scheduledFor: Date, options: PublishOptions = {}): Promise<ContentItem> {
    const response = await apiClient.post<ApiResponse<ContentItem>>(
      `/content/${contentId}/schedule`,
      { scheduledFor: scheduledFor.toISOString(), ...options }
    )
    return response.data
  }

  async unpublishContent(contentId: string): Promise<ContentItem> {
    const response = await apiClient.post<ApiResponse<ContentItem>>(
      `/content/${contentId}/unpublish`,
      {}
    )
    return response.data
  }

  async archiveContent(contentId: string): Promise<ContentItem> {
    const response = await apiClient.post<ApiResponse<ContentItem>>(
      `/content/${contentId}/archive`,
      {}
    )
    return response.data
  }

  async restoreContent(contentId: string): Promise<ContentItem> {
    const response = await apiClient.post<ApiResponse<ContentItem>>(
      `/content/${contentId}/restore`,
      {}
    )
    return response.data
  }

  // Approval workflow
  async requestApproval(contentId: string, message?: string): Promise<ApprovalRequest> {
    const response = await apiClient.post<ApiResponse<ApprovalRequest>>(
      `/content/${contentId}/request-approval`,
      { message }
    )
    return response.data
  }

  async getApprovalRequests(filters: ApprovalFilters = {}): Promise<PaginatedResponse<ApprovalRequest>> {
    return apiClient.get<PaginatedResponse<ApprovalRequest>>(
      '/approval-requests',
      filters
    )
  }

  async approveContent(requestId: string, comment?: string): Promise<ApprovalRequest> {
    const response = await apiClient.post<ApiResponse<ApprovalRequest>>(
      `/approval-requests/${requestId}/approve`,
      { comment }
    )
    return response.data
  }

  async rejectContent(requestId: string, comment: string): Promise<ApprovalRequest> {
    const response = await apiClient.post<ApiResponse<ApprovalRequest>>(
      `/approval-requests/${requestId}/reject`,
      { comment }
    )
    return response.data
  }

  async requestChanges(requestId: string, comment: string): Promise<ApprovalRequest> {
    const response = await apiClient.post<ApiResponse<ApprovalRequest>>(
      `/approval-requests/${requestId}/request-changes`,
      { comment }
    )
    return response.data
  }
}

export const contentWorkflowAPI = new ContentWorkflowService()

// React Query keys for caching
export const contentWorkflowKeys = {
  all: ['content-workflow'] as const,
  versions: (contentId: string) => [...contentWorkflowKeys.all, 'versions', contentId] as const,
  draft: (contentId: string) => [...contentWorkflowKeys.all, 'draft', contentId] as const,
  approvalRequests: (filters?: ApprovalFilters) => [...contentWorkflowKeys.all, 'approval-requests', filters] as const,
}