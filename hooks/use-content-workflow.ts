import { useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contentWorkflowAPI, contentWorkflowKeys, ApprovalFilters } from '@/lib/api/content-workflow'
import { ContentItem } from '@/lib/types/content'
import { 
  ContentVersion, 
  ContentDraft, 
  PublishOptions,
  getContentWorkflowState,
  validateContentForPublishing,
  generateChangeDescription
} from '@/lib/utils/content-workflow'
import { ApprovalRequest } from '@/components/ui/approval-workflow'
import { useToast } from './use-toast'

export interface UseContentWorkflowOptions {
  contentId: string
  content?: ContentItem
  userRole?: string
  hasApprovalWorkflow?: boolean
}

export function useContentWorkflow({
  contentId,
  content,
  userRole = 'admin',
  hasApprovalWorkflow = false,
}: UseContentWorkflowOptions) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // Get workflow state
  const workflowState = content 
    ? getContentWorkflowState(content, userRole, hasApprovalWorkflow)
    : null

  // Version history
  const {
    data: versions = [],
    isLoading: versionsLoading,
    error: versionsError,
  } = useQuery({
    queryKey: contentWorkflowKeys.versions(contentId),
    queryFn: () => contentWorkflowAPI.getVersionHistory(contentId),
    enabled: !!contentId,
  })

  // Draft management
  const {
    data: draft,
    isLoading: draftLoading,
  } = useQuery({
    queryKey: contentWorkflowKeys.draft(contentId),
    queryFn: () => contentWorkflowAPI.getDraft(contentId),
    enabled: !!contentId,
  })

  // Create version mutation
  const createVersionMutation = useMutation({
    mutationFn: ({ changeDescription }: { changeDescription?: string }) =>
      contentWorkflowAPI.createVersion(contentId, changeDescription),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentWorkflowKeys.versions(contentId) })
      toast({
        title: "Version created",
        description: "A new version has been saved to history.",
      })
    },
    onError: () => {
      toast({
        title: "Failed to create version",
        description: "There was an error saving the version.",
        variant: "destructive",
      })
    },
  })

  // Restore version mutation
  const restoreVersionMutation = useMutation({
    mutationFn: (versionId: string) =>
      contentWorkflowAPI.restoreVersion(contentId, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentWorkflowKeys.versions(contentId) })
      queryClient.invalidateQueries({ queryKey: ['content', contentId] })
      toast({
        title: "Version restored",
        description: "The content has been restored to the selected version.",
      })
    },
    onError: () => {
      toast({
        title: "Failed to restore version",
        description: "There was an error restoring the version.",
        variant: "destructive",
      })
    },
  })

  // Save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: (data: Partial<ContentItem>) =>
      contentWorkflowAPI.saveDraft(contentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentWorkflowKeys.draft(contentId) })
    },
  })

  // Publishing mutations
  const publishMutation = useMutation({
    mutationFn: (options?: PublishOptions) =>
      contentWorkflowAPI.publishContent(contentId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', contentId] })
      toast({
        title: "Content published",
        description: "Your content is now live on the website.",
      })
    },
    onError: () => {
      toast({
        title: "Failed to publish",
        description: "There was an error publishing the content.",
        variant: "destructive",
      })
    },
  })

  const scheduleMutation = useMutation({
    mutationFn: ({ scheduledFor, options }: { scheduledFor: Date; options?: PublishOptions }) =>
      contentWorkflowAPI.scheduleContent(contentId, scheduledFor, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', contentId] })
      toast({
        title: "Content scheduled",
        description: "Your content has been scheduled for publication.",
      })
    },
    onError: () => {
      toast({
        title: "Failed to schedule",
        description: "There was an error scheduling the content.",
        variant: "destructive",
      })
    },
  })

  const unpublishMutation = useMutation({
    mutationFn: () => contentWorkflowAPI.unpublishContent(contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', contentId] })
      toast({
        title: "Content unpublished",
        description: "Your content has been removed from the website.",
      })
    },
  })

  const archiveMutation = useMutation({
    mutationFn: () => contentWorkflowAPI.archiveContent(contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', contentId] })
      toast({
        title: "Content archived",
        description: "Your content has been moved to the archive.",
      })
    },
  })

  const restoreMutation = useMutation({
    mutationFn: () => contentWorkflowAPI.restoreContent(contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', contentId] })
      toast({
        title: "Content restored",
        description: "Your content has been restored from the archive.",
      })
    },
  })

  // Approval workflow mutations
  const requestApprovalMutation = useMutation({
    mutationFn: (message?: string) =>
      contentWorkflowAPI.requestApproval(contentId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', contentId] })
      toast({
        title: "Approval requested",
        description: "Your content has been submitted for review.",
      })
    },
  })

  // Helper functions
  const validateForPublishing = useCallback(() => {
    if (!content) return { isValid: false, errors: ['Content not loaded'], warnings: [] }
    return validateContentForPublishing(content)
  }, [content])

  const createVersionWithDescription = useCallback(
    async (oldContent: Partial<ContentItem>, newContent: Partial<ContentItem>) => {
      const changeDescription = generateChangeDescription(oldContent, newContent)
      return createVersionMutation.mutateAsync({ changeDescription })
    },
    [createVersionMutation]
  )

  const saveDraft = useCallback(
    async (data: Partial<ContentItem>) => {
      return saveDraftMutation.mutateAsync(data)
    },
    [saveDraftMutation]
  )

  const publish = useCallback(
    async (options?: PublishOptions) => {
      const validation = validateForPublishing()
      if (!validation.isValid) {
        toast({
          title: "Cannot publish content",
          description: validation.errors.join(', '),
          variant: "destructive",
        })
        return
      }

      if (validation.warnings.length > 0) {
        // You might want to show a confirmation dialog here
        console.warn('Publishing with warnings:', validation.warnings)
      }

      return publishMutation.mutateAsync(options)
    },
    [publishMutation, validateForPublishing, toast]
  )

  const schedule = useCallback(
    async (scheduledFor: Date, options?: PublishOptions) => {
      const validation = validateForPublishing()
      if (!validation.isValid) {
        toast({
          title: "Cannot schedule content",
          description: validation.errors.join(', '),
          variant: "destructive",
        })
        return
      }

      return scheduleMutation.mutateAsync({ scheduledFor, options })
    },
    [scheduleMutation, validateForPublishing, toast]
  )

  return {
    // State
    workflowState,
    versions,
    draft,
    
    // Loading states
    versionsLoading,
    draftLoading,
    isPublishing: publishMutation.isPending,
    isScheduling: scheduleMutation.isPending,
    isCreatingVersion: createVersionMutation.isPending,
    isSavingDraft: saveDraftMutation.isPending,
    
    // Actions
    createVersion: createVersionMutation.mutate,
    createVersionWithDescription,
    restoreVersion: restoreVersionMutation.mutate,
    saveDraft,
    publish,
    schedule,
    unpublish: unpublishMutation.mutate,
    archive: archiveMutation.mutate,
    restore: restoreMutation.mutate,
    requestApproval: requestApprovalMutation.mutate,
    
    // Validation
    validateForPublishing,
    
    // Errors
    versionsError,
  }
}

// Hook for approval requests management
export function useApprovalRequests(filters?: ApprovalFilters) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    data: approvalRequests,
    isLoading,
    error,
  } = useQuery({
    queryKey: contentWorkflowKeys.approvalRequests(filters),
    queryFn: () => contentWorkflowAPI.getApprovalRequests(filters),
  })

  const approveMutation = useMutation({
    mutationFn: ({ requestId, comment }: { requestId: string; comment?: string }) =>
      contentWorkflowAPI.approveContent(requestId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentWorkflowKeys.approvalRequests() })
      toast({
        title: "Content approved",
        description: "The content has been approved for publication.",
      })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ requestId, comment }: { requestId: string; comment: string }) =>
      contentWorkflowAPI.rejectContent(requestId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentWorkflowKeys.approvalRequests() })
      toast({
        title: "Content rejected",
        description: "The content has been rejected.",
      })
    },
  })

  const requestChangesMutation = useMutation({
    mutationFn: ({ requestId, comment }: { requestId: string; comment: string }) =>
      contentWorkflowAPI.requestChanges(requestId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentWorkflowKeys.approvalRequests() })
      toast({
        title: "Changes requested",
        description: "The author has been notified of the requested changes.",
      })
    },
  })

  return {
    approvalRequests: approvalRequests?.data || [],
    pagination: approvalRequests?.pagination,
    isLoading,
    error,
    
    approve: approveMutation.mutate,
    reject: rejectMutation.mutate,
    requestChanges: requestChangesMutation.mutate,
    
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isRequestingChanges: requestChangesMutation.isPending,
  }
}