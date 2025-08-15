import { apiClient, type ApiResponse, type PaginatedResponse } from './client'
import type { FormSubmission, FormResponse, FormFilters, ResponseData } from '../types'
import { notificationsApi } from './notifications'
import { checkForSpam } from '../utils/spam-detection'
import { emailNotificationService } from '../utils/email-notifications'

export class FormsApi {
  // Get all form submissions with filtering and pagination
  static async getFormSubmissions(
    filters?: FormFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<FormSubmission>> {
    const params: Record<string, any> = { page, limit }
    
    if (filters) {
      if (filters.status?.length) params.status = filters.status.join(',')
      if (filters.priority?.length) params.priority = filters.priority.join(',')
      if (filters.type?.length) params.type = filters.type.join(',')
      if (filters.assignedTo) params.assignedTo = filters.assignedTo
      if (filters.search) params.search = filters.search
      if (filters.dateRange) {
        params.dateFrom = filters.dateRange.from.toISOString()
        params.dateTo = filters.dateRange.to.toISOString()
      }
    }

    return apiClient.get<PaginatedResponse<FormSubmission>>('/forms', params)
  }

  // Get a specific form submission by ID
  static async getFormSubmission(id: string): Promise<ApiResponse<FormSubmission>> {
    return apiClient.get<ApiResponse<FormSubmission>>(`/forms/${id}`)
  }

  // Update form submission status and notes
  static async updateFormSubmission(
    id: string, 
    updates: Partial<Pick<FormSubmission, 'status' | 'priority' | 'assignedTo' | 'notes' | 'tags'>>
  ): Promise<ApiResponse<FormSubmission>> {
    return apiClient.patch<ApiResponse<FormSubmission>>(`/forms/${id}`, updates)
  }

  // Send response to form submission
  static async sendResponse(
    formId: string, 
    responseData: ResponseData
  ): Promise<ApiResponse<FormResponse>> {
    const formData = new FormData()
    formData.append('content', responseData.content)
    formData.append('method', responseData.method)
    
    if (responseData.scheduleFollowUp) {
      formData.append('scheduleFollowUp', responseData.scheduleFollowUp.toISOString())
    }
    
    if (responseData.attachments?.length) {
      responseData.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file)
      })
    }

    return apiClient.request<ApiResponse<FormResponse>>(`/forms/${formId}/respond`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    })
  }

  // Get form responses for a specific submission
  static async getFormResponses(formId: string): Promise<ApiResponse<FormResponse[]>> {
    return apiClient.get<ApiResponse<FormResponse[]>>(`/forms/${formId}/responses`)
  }

  // Archive form submission
  static async archiveFormSubmission(id: string): Promise<ApiResponse<void>> {
    return apiClient.patch<ApiResponse<void>>(`/forms/${id}`, { status: 'archived' })
  }

  // Get form statistics
  static async getFormStats(): Promise<ApiResponse<{
    total: number
    byStatus: Record<FormSubmission['status'], number>
    byPriority: Record<FormSubmission['priority'], number>
    byType: Record<FormSubmission['type'], number>
    recentCount: number
  }>> {
    return apiClient.get<ApiResponse<any>>('/forms/stats')
  }

  // Bulk update form submissions
  static async bulkUpdateForms(
    formIds: string[],
    updates: Partial<Pick<FormSubmission, 'status' | 'priority' | 'assignedTo' | 'tags' | 'notes'>>
  ): Promise<ApiResponse<void>> {
    return apiClient.patch<ApiResponse<void>>('/forms/bulk', {
      formIds,
      updates
    })
  }

  // Submit new form with spam detection and notifications
  static async submitForm(formData: {
    type: FormSubmission['type']
    customerInfo: FormSubmission['customerInfo']
    formData: Record<string, any>
    ipAddress?: string
    userAgent?: string
  }): Promise<ApiResponse<FormSubmission>> {
    try {
      // Check for spam before processing
      const spamResult = await checkForSpam(
        'temp-id', // Will be replaced with actual ID after creation
        {
          ...formData.customerInfo,
          ...formData.formData
        },
        formData.ipAddress,
        formData.userAgent
      )

      // If high confidence spam, block the submission
      if (spamResult.isSpam && spamResult.confidence >= 80) {
        // Log spam attempt
        await emailNotificationService.sendSpamDetectionNotification({
          formType: formData.type,
          submittedName: formData.customerInfo.name,
          submittedEmail: formData.customerInfo.email,
          ipAddress: formData.ipAddress,
          spamScore: spamResult.confidence,
          spamReasons: spamResult.reasons,
          detectionTime: new Date()
        })

        throw new Error('Submission blocked due to spam detection')
      }

      // Create the form submission
      const submission = await apiClient.post<ApiResponse<FormSubmission>>('/forms', {
        ...formData,
        spamScore: spamResult.confidence,
        spamReasons: spamResult.reasons,
        flaggedAsSpam: spamResult.flagged
      })

      if (submission.success) {
        // Create notification for new form submission
        const isUrgent = formData.formData.priority === 'urgent' || 
                        formData.formData.emergency === true ||
                        formData.type === 'emergency_service'

        await notificationsApi.createNotification({
          type: 'form_submission',
          title: `New ${formData.type.replace('_', ' ')} submission`,
          message: `${formData.customerInfo.name} submitted a ${formData.type.replace('_', ' ')} inquiry`,
          priority: isUrgent ? 'urgent' : 'high',
          actionUrl: `/admin/forms/${submission.data.id}`,
          metadata: {
            formId: submission.data.id,
            customerName: formData.customerInfo.name,
            customerEmail: formData.customerInfo.email,
            formType: formData.type
          }
        })

        // Send email notification
        await emailNotificationService.sendFormSubmissionNotification({
          formId: submission.data.id,
          formType: formData.type,
          customerName: formData.customerInfo.name,
          customerEmail: formData.customerInfo.email,
          customerPhone: formData.customerInfo.phone,
          serviceType: formData.formData.serviceType,
          message: formData.formData.message || formData.formData.description || 'No message provided',
          isUrgent,
          submissionDate: new Date()
        })

        // If borderline spam, create notification for review
        if (spamResult.confidence >= 40 && spamResult.confidence < 80) {
          await notificationsApi.createNotification({
            type: 'system',
            title: 'Form submission flagged for review',
            message: `Submission from ${formData.customerInfo.name} has ${spamResult.confidence}% spam confidence`,
            priority: 'medium',
            actionUrl: `/admin/settings/notifications?tab=spam`,
            metadata: {
              formId: submission.data.id,
              spamScore: spamResult.confidence,
              spamReasons: spamResult.reasons
            }
          })
        }
      }

      return submission
    } catch (error) {
      console.error('Form submission error:', error)
      throw error
    }
  }

  // Schedule follow-up reminder
  static async scheduleFollowUp(
    formId: string,
    reminderDate: Date,
    notes?: string
  ): Promise<ApiResponse<void>> {
    try {
      // Update form with follow-up date
      await apiClient.patch<ApiResponse<void>>(`/forms/${formId}`, {
        followUpDate: reminderDate,
        followUpNotes: notes
      })

      // Create reminder notification
      await notificationsApi.createNotification({
        type: 'reminder',
        title: 'Follow-up reminder scheduled',
        message: `Follow-up reminder set for ${reminderDate.toLocaleDateString()}`,
        priority: 'medium',
        actionUrl: `/admin/forms/${formId}`,
        metadata: {
          formId,
          reminderDate: reminderDate.toISOString(),
          notes
        }
      })

      return { success: true, data: undefined }
    } catch (error) {
      console.error('Failed to schedule follow-up:', error)
      throw error
    }
  }
}