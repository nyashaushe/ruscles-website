export interface Notification {
  id: string
  type: 'form_submission' | 'content_published' | 'reminder' | 'system'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  actionUrl?: string
  metadata?: Record<string, any>
}

export interface NotificationPreferences {
  emailNotifications: boolean
  browserNotifications: boolean
  soundEnabled: boolean
  notificationTypes: {
    formSubmissions: boolean
    urgentInquiries: boolean
    contentReminders: boolean
    systemUpdates: boolean
  }
}