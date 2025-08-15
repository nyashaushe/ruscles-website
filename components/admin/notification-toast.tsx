'use client'

import { useEffect, useState } from 'react'
import { X, Bell, AlertTriangle, CheckCircle, Info, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Notification } from '@/lib/types/notifications'
import { formatDistanceToNow } from 'date-fns'

interface NotificationToastProps {
  notification: Notification
  onDismiss: () => void
  onAction?: () => void
  autoHide?: boolean
  hideDelay?: number
}

export function NotificationToast({
  notification,
  onDismiss,
  onAction,
  autoHide = true,
  hideDelay = 5000
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (autoHide && notification.priority !== 'urgent') {
      const timer = setTimeout(() => {
        handleDismiss()
      }, hideDelay)

      return () => clearTimeout(timer)
    }
  }, [autoHide, hideDelay, notification.priority])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      onDismiss()
    }, 300) // Animation duration
  }

  const handleAction = () => {
    if (onAction) {
      onAction()
    }
    handleDismiss()
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'form_submission':
        return <Bell className="h-5 w-5 text-blue-500" />
      case 'content_published':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'reminder':
        return <Clock className="h-5 w-5 text-orange-500" />
      case 'system':
        return <Info className="h-5 w-5 text-gray-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityStyles = () => {
    switch (notification.priority) {
      case 'urgent':
        return 'border-red-500 bg-red-50 shadow-red-100'
      case 'high':
        return 'border-orange-500 bg-orange-50 shadow-orange-100'
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 shadow-yellow-100'
      case 'low':
        return 'border-gray-300 bg-white shadow-gray-100'
      default:
        return 'border-gray-300 bg-white shadow-gray-100'
    }
  }

  const getPriorityBadgeVariant = () => {
    switch (notification.priority) {
      case 'urgent':
        return 'destructive'
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  if (!isVisible) return null

  return (
    <Card
      className={`
        fixed top-4 right-4 w-96 z-50 border-2 shadow-lg transition-all duration-300 ease-in-out
        ${getPriorityStyles()}
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        ${notification.priority === 'urgent' ? 'animate-pulse' : ''}
      `}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {notification.title}
                </h4>
                <Badge variant={getPriorityBadgeVariant()} className="text-xs">
                  {notification.priority}
                </Badge>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0 hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-gray-700 mb-2">
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
              </span>
              
              {notification.actionUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAction}
                  className="text-xs h-7"
                >
                  View Details
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {notification.priority === 'urgent' && (
          <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-xs font-medium text-red-800">
                Urgent: Immediate attention required
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Container component for managing multiple toasts
interface NotificationToastContainerProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
  onAction: (notification: Notification) => void
  maxToasts?: number
}

export function NotificationToastContainer({
  notifications,
  onDismiss,
  onAction,
  maxToasts = 3
}: NotificationToastContainerProps) {
  // Show only the most recent notifications, prioritizing urgent ones
  const sortedNotifications = [...notifications]
    .sort((a, b) => {
      // Urgent notifications first
      if (a.priority === 'urgent' && b.priority !== 'urgent') return -1
      if (b.priority === 'urgent' && a.priority !== 'urgent') return 1
      
      // Then by timestamp (newest first)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
    .slice(0, maxToasts)

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {sortedNotifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            transform: `translateY(${index * 8}px)`,
            zIndex: 50 - index
          }}
        >
          <NotificationToast
            notification={notification}
            onDismiss={() => onDismiss(notification.id)}
            onAction={() => onAction(notification)}
            autoHide={notification.priority !== 'urgent'}
          />
        </div>
      ))}
    </div>
  )
}