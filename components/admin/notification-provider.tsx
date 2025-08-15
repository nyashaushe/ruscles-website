'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useNotifications } from '@/hooks/use-notifications'
import { NotificationToastContainer } from '@/components/admin/notification-toast'
import { Notification } from '@/lib/types/notifications'

interface NotificationContextType {
  showToast: (notification: Notification) => void
  hideToast: (id: string) => void
  clearAllToasts: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [toastNotifications, setToastNotifications] = useState<Notification[]>([])
  const { notifications } = useNotifications({
    pollInterval: 30000, // Poll every 30 seconds
    enableSound: true,
    enableBrowserNotifications: true
  })

  // Show new notifications as toasts
  useEffect(() => {
    const newNotifications = notifications.filter(notification => {
      // Only show notifications from the last 5 minutes as toasts
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      const notificationTime = new Date(notification.timestamp)
      
      return (
        !notification.isRead &&
        notificationTime > fiveMinutesAgo &&
        !toastNotifications.some(toast => toast.id === notification.id)
      )
    })

    if (newNotifications.length > 0) {
      setToastNotifications(prev => [...newNotifications, ...prev])
    }
  }, [notifications, toastNotifications])

  const showToast = (notification: Notification) => {
    setToastNotifications(prev => {
      // Avoid duplicates
      if (prev.some(toast => toast.id === notification.id)) {
        return prev
      }
      return [notification, ...prev]
    })
  }

  const hideToast = (id: string) => {
    setToastNotifications(prev => prev.filter(toast => toast.id !== id))
  }

  const clearAllToasts = () => {
    setToastNotifications([])
  }

  const handleToastAction = (notification: Notification) => {
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  const contextValue: NotificationContextType = {
    showToast,
    hideToast,
    clearAllToasts
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationToastContainer
        notifications={toastNotifications}
        onDismiss={hideToast}
        onAction={handleToastAction}
        maxToasts={3}
      />
    </NotificationContext.Provider>
  )
}