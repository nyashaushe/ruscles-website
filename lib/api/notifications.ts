import { apiClient, ApiResponse, PaginatedResponse } from './client'
import { Notification, NotificationPreferences } from '@/lib/types/notifications'

export interface NotificationFilters {
  type?: Notification['type']
  priority?: Notification['priority']
  isRead?: boolean
  startDate?: string
  endDate?: string
}

export interface CreateNotificationData {
  type: Notification['type']
  title: string
  message: string
  priority: Notification['priority']
  actionUrl?: string
  metadata?: Record<string, any>
}

export interface SpamDetectionResult {
  isSpam: boolean
  confidence: number
  reasons: string[]
  flagged: boolean
}

export interface FormSubmissionSpamCheck {
  formId: string
  submissionData: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

class NotificationsApi {
  // Get notifications with filtering and pagination
  async getNotifications(
    filters: NotificationFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Notification>> {
    const params = {
      ...filters,
      page: page.toString(),
      limit: limit.toString(),
    }

    return apiClient.get<PaginatedResponse<Notification>>('/notifications', params)
  }

  // Get unread notification count
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count')
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<ApiResponse<void>> {
    return apiClient.patch<ApiResponse<void>>(`/notifications/${notificationId}/read`, {})
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<ApiResponse<void>> {
    return apiClient.patch<ApiResponse<void>>('/notifications/mark-all-read', {})
  }

  // Create a new notification
  async createNotification(data: CreateNotificationData): Promise<ApiResponse<Notification>> {
    return apiClient.post<ApiResponse<Notification>>('/notifications', data)
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/notifications/${notificationId}`)
  }

  // Get notification preferences
  async getPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    return apiClient.get<ApiResponse<NotificationPreferences>>('/notifications/preferences')
  }

  // Update notification preferences
  async updatePreferences(preferences: NotificationPreferences): Promise<ApiResponse<NotificationPreferences>> {
    return apiClient.put<ApiResponse<NotificationPreferences>>('/notifications/preferences', preferences)
  }

  // Send email notification
  async sendEmailNotification(data: {
    to: string[]
    subject: string
    message: string
    priority: Notification['priority']
    formId?: string
    metadata?: Record<string, any>
  }): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/notifications/email', data)
  }

  // Check for spam in form submission
  async checkSpam(data: FormSubmissionSpamCheck): Promise<ApiResponse<SpamDetectionResult>> {
    return apiClient.post<ApiResponse<SpamDetectionResult>>('/notifications/spam-check', data)
  }

  // Flag form submission as spam
  async flagAsSpam(formId: string, reason: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(`/notifications/flag-spam/${formId}`, { reason })
  }

  // Get spam statistics
  async getSpamStats(): Promise<ApiResponse<{
    totalSubmissions: number
    spamDetected: number
    spamRate: number
    recentSpamTrends: Array<{ date: string; count: number }>
  }>> {
    return apiClient.get<ApiResponse<any>>('/notifications/spam-stats')
  }

  // Real-time notification polling
  async pollForUpdates(lastCheckTime: string): Promise<ApiResponse<{
    notifications: Notification[]
    hasNewNotifications: boolean
    lastUpdateTime: string
  }>> {
    return apiClient.get<ApiResponse<any>>('/notifications/poll', {
      since: lastCheckTime
    })
  }

  // Test notification system
  async testNotification(type: Notification['type']): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/notifications/test', { type })
  }
}

export const notificationsApi = new NotificationsApi()