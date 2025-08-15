"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Clock, 
  Bell, 
  Plus,
  Trash2,
  Edit
} from "lucide-react"
import { formatDateTime } from "@/lib/utils"

interface FollowUpReminder {
  id: string
  formId: string
  scheduledFor: Date
  type: 'call' | 'email' | 'meeting' | 'general'
  title: string
  description?: string
  isCompleted: boolean
  createdAt: Date
}

interface FollowUpSchedulerProps {
  formId: string
  reminders: FollowUpReminder[]
  onScheduleReminder: (reminder: Omit<FollowUpReminder, 'id' | 'formId' | 'isCompleted' | 'createdAt'>) => Promise<void>
  onUpdateReminder: (id: string, updates: Partial<FollowUpReminder>) => Promise<void>
  onDeleteReminder: (id: string) => Promise<void>
}

export function FollowUpScheduler({ 
  formId, 
  reminders, 
  onScheduleReminder, 
  onUpdateReminder, 
  onDeleteReminder 
}: FollowUpSchedulerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [reminderType, setReminderType] = useState<FollowUpReminder['type']>('call')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledFor, setScheduledFor] = useState('')

  const handleScheduleReminder = async () => {
    if (!title.trim() || !scheduledFor) return

    setIsLoading(true)
    try {
      await onScheduleReminder({
        type: reminderType,
        title: title.trim(),
        description: description.trim() || undefined,
        scheduledFor: new Date(scheduledFor)
      })
      
      // Reset form
      setTitle('')
      setDescription('')
      setScheduledFor('')
      setReminderType('call')
      setIsDialogOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteReminder = async (reminderId: string) => {
    await onUpdateReminder(reminderId, { isCompleted: true })
  }

  const getTypeIcon = (type: FollowUpReminder['type']) => {
    switch (type) {
      case 'call': return '📞'
      case 'email': return '📧'
      case 'meeting': return '🤝'
      default: return '📋'
    }
  }

  const getTypeColor = (type: FollowUpReminder['type']) => {
    switch (type) {
      case 'call': return 'bg-blue-100 text-blue-800'
      case 'email': return 'bg-green-100 text-green-800'
      case 'meeting': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const upcomingReminders = reminders.filter(r => !r.isCompleted && new Date(r.scheduledFor) > new Date())
  const overdueReminders = reminders.filter(r => !r.isCompleted && new Date(r.scheduledFor) <= new Date())
  const completedReminders = reminders.filter(r => r.isCompleted)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Follow-up Reminders
            </CardTitle>
            <CardDescription>
              Schedule and manage follow-up tasks for this form
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Reminder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Follow-up Reminder</DialogTitle>
                <DialogDescription>
                  Create a reminder for future follow-up actions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Reminder Type</Label>
                  <Select value={reminderType} onValueChange={(value: FollowUpReminder['type']) => setReminderType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="email">Email Follow-up</SelectItem>
                      <SelectItem value="meeting">Schedule Meeting</SelectItem>
                      <SelectItem value="general">General Task</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="e.g., Follow up on quote request"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea
                    placeholder="Additional details about this follow-up..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Scheduled For</Label>
                  <Input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleScheduleReminder} 
                  disabled={isLoading || !title.trim() || !scheduledFor}
                >
                  {isLoading ? 'Scheduling...' : 'Schedule Reminder'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overdue Reminders */}
        {overdueReminders.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-xs">
                {overdueReminders.length} Overdue
              </Badge>
            </div>
            <div className="space-y-2">
              {overdueReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-start gap-3 p-3 border border-red-200 rounded-lg bg-red-50">
                  <div className="text-lg">{getTypeIcon(reminder.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 truncate">{reminder.title}</h4>
                      <Badge className={getTypeColor(reminder.type)} variant="outline">
                        {reminder.type}
                      </Badge>
                    </div>
                    {reminder.description && (
                      <p className="text-sm text-gray-600 mb-2">{reminder.description}</p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <Clock className="h-3 w-3" />
                      Overdue: {formatDateTime(reminder.scheduledFor)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCompleteReminder(reminder.id)}
                    >
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteReminder(reminder.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Reminders */}
        {upcomingReminders.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {upcomingReminders.length} Upcoming
              </Badge>
            </div>
            <div className="space-y-2">
              {upcomingReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
                  <div className="text-lg">{getTypeIcon(reminder.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 truncate">{reminder.title}</h4>
                      <Badge className={getTypeColor(reminder.type)} variant="outline">
                        {reminder.type}
                      </Badge>
                    </div>
                    {reminder.description && (
                      <p className="text-sm text-gray-600 mb-2">{reminder.description}</p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {formatDateTime(reminder.scheduledFor)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCompleteReminder(reminder.id)}
                    >
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteReminder(reminder.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Reminders */}
        {completedReminders.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {completedReminders.length} Completed
              </Badge>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {completedReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-start gap-3 p-2 text-sm text-gray-500">
                  <div className="text-base opacity-50">{getTypeIcon(reminder.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="line-through truncate">{reminder.title}</span>
                      <Badge className={getTypeColor(reminder.type)} variant="outline" size="sm">
                        {reminder.type}
                      </Badge>
                    </div>
                    <div className="text-xs">
                      Completed: {formatDateTime(reminder.scheduledFor)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {reminders.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No follow-up reminders scheduled</p>
            <p className="text-sm">Click "Add Reminder" to schedule follow-up tasks</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}