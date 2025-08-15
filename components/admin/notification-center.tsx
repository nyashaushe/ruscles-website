'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Settings, Check, AlertTriangle, Info, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useNotifications } from '@/hooks/use-notifications'
import { Notification, NotificationPreferences } from '@/lib/types/notifications'
import { formatDistanceToNow } from 'date-fns'

interface NotificationCenterProps {
  className?: string
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    preferences,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    isLoading
  } = useNotifications()

  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('notifications')

  const getNotificationIcon = (type: Notification['type'], priority: Notification['priority']) => {
    if (priority === 'urgent') {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
    
    switch (type) {
      case 'form_submission':
        return <Bell className="h-4 w-4 text-blue-500" />
      case 'content_published':
        return <Check className="h-4 w-4 text-green-500" />
      case 'reminder':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'system':
        return <Info className="h-4 w-4 text-gray-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 border-red-200'
      case 'high':
        return 'bg-orange-100 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 border-yellow-200'
      case 'low':
        return 'bg-gray-100 border-gray-200'
      default:
        return 'bg-gray-100 border-gray-200'
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    updatePreferences({ ...preferences, [key]: value })
  }

  const handleNotificationTypeChange = (
    type: keyof NotificationPreferences['notificationTypes'],
    value: boolean
  ) => {
    updatePreferences({
      ...preferences,
      notificationTypes: {
        ...preferences.notificationTypes,
        [type]: value
      }
    })
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative ${className}`}
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between p-4 border-b">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="notifications">
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="notifications" className="m-0">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Recent Notifications</h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
              </div>
            </div>

            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {notifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        !notification.isRead ? 'bg-blue-50 border-blue-200' : ''
                      } ${getPriorityColor(notification.priority)}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type, notification.priority)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings" className="m-0">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Notification Settings</h3>
            </div>

            <ScrollArea className="h-96">
              <div className="p-4 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">General Settings</h4>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications" className="text-sm">
                      Email notifications
                    </Label>
                    <Switch
                      id="email-notifications"
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) => 
                        handlePreferenceChange('emailNotifications', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="browser-notifications" className="text-sm">
                      Browser notifications
                    </Label>
                    <Switch
                      id="browser-notifications"
                      checked={preferences.browserNotifications}
                      onCheckedChange={(checked) => 
                        handlePreferenceChange('browserNotifications', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-enabled" className="text-sm">
                      Sound alerts
                    </Label>
                    <Switch
                      id="sound-enabled"
                      checked={preferences.soundEnabled}
                      onCheckedChange={(checked) => 
                        handlePreferenceChange('soundEnabled', checked)
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Notification Types</h4>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="form-submissions" className="text-sm">
                      Form submissions
                    </Label>
                    <Switch
                      id="form-submissions"
                      checked={preferences.notificationTypes.formSubmissions}
                      onCheckedChange={(checked) => 
                        handleNotificationTypeChange('formSubmissions', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="urgent-inquiries" className="text-sm">
                      Urgent inquiries
                    </Label>
                    <Switch
                      id="urgent-inquiries"
                      checked={preferences.notificationTypes.urgentInquiries}
                      onCheckedChange={(checked) => 
                        handleNotificationTypeChange('urgentInquiries', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="content-reminders" className="text-sm">
                      Content reminders
                    </Label>
                    <Switch
                      id="content-reminders"
                      checked={preferences.notificationTypes.contentReminders}
                      onCheckedChange={(checked) => 
                        handleNotificationTypeChange('contentReminders', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="system-updates" className="text-sm">
                      System updates
                    </Label>
                    <Switch
                      id="system-updates"
                      checked={preferences.notificationTypes.systemUpdates}
                      onCheckedChange={(checked) => 
                        handleNotificationTypeChange('systemUpdates', checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}