'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { notificationsApi, NotificationFilters } from '@/lib/api/notifications'
import { Notification, NotificationPreferences } from '@/lib/types/notifications'

interface UseNotificationsOptions {
  pollInterval?: number
  autoMarkAsRead?: boolean
  enableSound?: boolean
  enableBrowserNotifications?: boolean
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  preferences: NotificationPreferences
  isLoading: boolean
  error: string | null
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  updatePreferences: (preferences: NotificationPreferences) => Promise<void>
  refresh: () => Promise<void>
  testNotification: (type: Notification['type']) => Promise<void>
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailNotifications: true,
  browserNotifications: true,
  soundEnabled: true,
  notificationTypes: {
    formSubmissions: true,
    urgentInquiries: true,
    contentReminders: true,
    systemUpdates: true,
  }
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const {
    pollInterval = 30000, // 30 seconds
    autoMarkAsRead = false,
    enableSound = true,
    enableBrowserNotifications = true
  } = options || {}

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const lastCheckTimeRef = useRef<string>(new Date().toISOString())
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio for notifications
  useEffect(() => {
    if (enableSound && typeof window !== 'undefined') {
      try {
        audioRef.current = new Audio('/sounds/notification.mp3')
        audioRef.current.volume = 0.5
      } catch (error) {
        console.warn('Failed to initialize notification audio:', error)
      }
    }
  }, [enableSound])

  // Request browser notification permission
  useEffect(() => {
    if (enableBrowserNotifications && typeof window !== 'undefined' && 'Notification' in window && window.Notification) {
      if (window.Notification.permission === 'default') {
        window.Notification.requestPermission()
      }
    }
  }, [enableBrowserNotifications])

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [notificationsResponse, preferencesResponse, unreadResponse] = await Promise.all([
        notificationsApi.getNotifications({}, 1, 50),
        notificationsApi.getPreferences(),
        notificationsApi.getUnreadCount()
      ])

      if (notificationsResponse.success) {
        setNotifications(notificationsResponse.data)
      }

      if (preferencesResponse.success) {
        setPreferences(preferencesResponse.data)
      }

      if (unreadResponse.success) {
        setUnreadCount(unreadResponse.data.count)
      }

      lastCheckTimeRef.current = new Date().toISOString()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Poll for new notifications
  const pollForUpdates = useCallback(async () => {
    try {
      const response = await notificationsApi.pollForUpdates(lastCheckTimeRef.current)
      
      if (response.success && response.data.hasNewNotifications) {
        const newNotifications = response.data.notifications
        
        // Update notifications list
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id))
          const uniqueNewNotifications = newNotifications.filter(n => !existingIds.has(n.id))
          return [...uniqueNewNotifications, ...prev].slice(0, 50) // Keep only latest 50
        })

        // Update unread count
        const newUnreadCount = newNotifications.filter(n => !n.isRead).length
        if (newUnreadCount > 0) {
          setUnreadCount(prev => prev + newUnreadCount)
        }

        // Play sound for new notifications
        if (enableSound && preferences.soundEnabled && newNotifications.length > 0) {
          audioRef.current?.play().catch(() => {
            // Ignore audio play errors (user interaction required)
          })
        }

        // Show browser notifications
        if (enableBrowserNotifications && preferences.browserNotifications && typeof window !== 'undefined' && window.Notification) {
          newNotifications.forEach(notification => {
            if (window.Notification.permission === 'granted') {
              new window.Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico',
                tag: notification.id,
              })
            }
          })
        }

        lastCheckTimeRef.current = response.data.lastUpdateTime
      }
    } catch (err) {
      console.error('Failed to poll for notifications:', err)
    }
  }, [enableSound, enableBrowserNotifications, preferences.soundEnabled, preferences.browserNotifications])

  // Start polling
  useEffect(() => {
    loadInitialData()

    // Set up polling interval
    pollIntervalRef.current = setInterval(pollForUpdates, pollInterval)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [loadInitialData, pollForUpdates, pollInterval])

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await notificationsApi.markAsRead(id)
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, isRead: true }
              : notification
          )
        )
        
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read')
    }
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationsApi.markAllAsRead()
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        )
        setUnreadCount(0)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read')
    }
  }, [])

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences: NotificationPreferences) => {
    try {
      const response = await notificationsApi.updatePreferences(newPreferences)
      
      if (response.success) {
        setPreferences(response.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences')
    }
  }, [])

  // Refresh notifications
  const refresh = useCallback(async () => {
    await loadInitialData()
  }, [loadInitialData])

  // Test notification
  const testNotification = useCallback(async (type: Notification['type']) => {
    try {
      await notificationsApi.testNotification(type)
      // Refresh to see the test notification
      setTimeout(refresh, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send test notification')
    }
  }, [refresh])

  return {
    notifications,
    unreadCount,
    preferences,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    refresh,
    testNotification
  }
}