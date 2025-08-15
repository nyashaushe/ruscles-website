'use client'

import { useState } from 'react'
import { Bell, Mail, Volume2, Shield, TestTube, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useNotifications } from '@/hooks/use-notifications'
import { SpamDetectionDashboard } from '@/components/admin/spam-detection-dashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

export default function NotificationSettingsPage() {
  const { preferences, updatePreferences, testNotification } = useNotifications()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const handlePreferenceChange = async (key: keyof typeof preferences, value: boolean) => {
    try {
      setIsSaving(true)
      await updatePreferences({ ...preferences, [key]: value })
      toast({
        title: 'Settings updated',
        description: 'Your notification preferences have been saved.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleNotificationTypeChange = async (
    type: keyof typeof preferences.notificationTypes,
    value: boolean
  ) => {
    try {
      setIsSaving(true)
      await updatePreferences({
        ...preferences,
        notificationTypes: {
          ...preferences.notificationTypes,
          [type]: value
        }
      })
      toast({
        title: 'Settings updated',
        description: 'Your notification preferences have been saved.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestNotification = async (type: 'form_submission' | 'content_published' | 'reminder' | 'system') => {
    try {
      setIsTesting(true)
      await testNotification(type)
      toast({
        title: 'Test notification sent',
        description: 'Check your notification center for the test notification.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send test notification.',
        variant: 'destructive',
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
        <p className="text-muted-foreground">
          Manage your notification preferences and spam detection settings.
        </p>
      </div>

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList>
          <TabsTrigger value="preferences">Notification Preferences</TabsTrigger>
          <TabsTrigger value="spam">Spam Detection</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>General Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-base">
                    Email notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email for important updates
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('emailNotifications', checked)
                  }
                  disabled={isSaving}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="browser-notifications" className="text-base">
                    Browser notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show desktop notifications when the admin panel is open
                  </p>
                </div>
                <Switch
                  id="browser-notifications"
                  checked={preferences.browserNotifications}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('browserNotifications', checked)
                  }
                  disabled={isSaving}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound-enabled" className="text-base">
                    Sound alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Play sound when new notifications arrive
                  </p>
                </div>
                <Switch
                  id="sound-enabled"
                  checked={preferences.soundEnabled}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('soundEnabled', checked)
                  }
                  disabled={isSaving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Notification Types</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="form-submissions" className="text-base">
                    Form submissions
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new contact forms or service inquiries are submitted
                  </p>
                </div>
                <Switch
                  id="form-submissions"
                  checked={preferences.notificationTypes.formSubmissions}
                  onCheckedChange={(checked) => 
                    handleNotificationTypeChange('formSubmissions', checked)
                  }
                  disabled={isSaving}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="urgent-inquiries" className="text-base">
                    Urgent inquiries
                    <Badge variant="destructive" className="ml-2">High Priority</Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Immediate notifications for urgent service requests and emergencies
                  </p>
                </div>
                <Switch
                  id="urgent-inquiries"
                  checked={preferences.notificationTypes.urgentInquiries}
                  onCheckedChange={(checked) => 
                    handleNotificationTypeChange('urgentInquiries', checked)
                  }
                  disabled={isSaving}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="content-reminders" className="text-base">
                    Content reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Reminders for scheduled content publication and content updates
                  </p>
                </div>
                <Switch
                  id="content-reminders"
                  checked={preferences.notificationTypes.contentReminders}
                  onCheckedChange={(checked) => 
                    handleNotificationTypeChange('contentReminders', checked)
                  }
                  disabled={isSaving}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="system-updates" className="text-base">
                    System updates
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about system maintenance, updates, and important announcements
                  </p>
                </div>
                <Switch
                  id="system-updates"
                  checked={preferences.notificationTypes.systemUpdates}
                  onCheckedChange={(checked) => 
                    handleNotificationTypeChange('systemUpdates', checked)
                  }
                  disabled={isSaving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Test Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="h-5 w-5" />
                <span>Test Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleTestNotification('form_submission')}
                  disabled={isTesting}
                  className="justify-start"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Test Form Submission
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleTestNotification('content_published')}
                  disabled={isTesting}
                  className="justify-start"
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  Test Content Published
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleTestNotification('reminder')}
                  disabled={isTesting}
                  className="justify-start"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Test Reminder
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleTestNotification('system')}
                  disabled={isTesting}
                  className="justify-start"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Test System Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spam" className="space-y-6">
          <SpamDetectionDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}