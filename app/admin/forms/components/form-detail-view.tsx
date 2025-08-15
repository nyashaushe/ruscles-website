"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  MessageSquare, 
  Clock,
  ArrowLeft,
  Send,
  UserCheck,
  Archive
} from "lucide-react"
import { StatusBadge } from "@/components/ui/status-badge"
import { PriorityBadge } from "@/components/ui/priority-badge"
import { ResponseComposer } from "./response-composer"
import { formatDateTime, formatFormType } from "@/lib/utils"
import type { FormSubmission, FormResponse } from "@/lib/types"
import Link from "next/link"

interface FormDetailViewProps {
  form: FormSubmission
  onStatusChange: (status: FormSubmission['status']) => Promise<void>
  onSendResponse: (response: Omit<FormResponse, 'id' | 'formId' | 'respondedAt'>) => Promise<void>
}

export function FormDetailView({ form, onStatusChange, onSendResponse }: FormDetailViewProps) {
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false)
  const [notes, setNotes] = useState(form.notes || "")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isSavingNotes, setIsSavingNotes] = useState(false)

  const handleStatusChange = async (newStatus: FormSubmission['status']) => {
    setIsUpdatingStatus(true)
    try {
      await onStatusChange(newStatus)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleSendResponse = async (responseData: Omit<FormResponse, 'id' | 'formId' | 'respondedAt'>) => {
    await onSendResponse(responseData)
    setIsResponseDialogOpen(false)
  }

  const handleSaveNotes = async () => {
    setIsSavingNotes(true)
    try {
      // This would typically call an API to update notes
      // await updateFormNotes(form.id, notes)
    } finally {
      setIsSavingNotes(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/forms">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forms
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Form Submission #{form.id.slice(-8)}
            </h1>
            <p className="text-gray-600">
              Submitted {formatDateTime(form.submittedAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={form.status} />
          <PriorityBadge priority={form.priority} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Name</Label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{form.customerInfo.name}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a 
                      href={`mailto:${form.customerInfo.email}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {form.customerInfo.email}
                    </a>
                  </div>
                </div>
                {form.customerInfo.phone && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Phone</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a 
                        href={`tel:${form.customerInfo.phone}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {form.customerInfo.phone}
                      </a>
                    </div>
                  </div>
                )}
                {form.customerInfo.company && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Company</Label>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{form.customerInfo.company}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Form Details */}
          <Card>
            <CardHeader>
              <CardTitle>Form Details</CardTitle>
              <CardDescription>
                {formatFormType(form.type)} submitted on {formatDateTime(form.submittedAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(form.formData).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Label>
                  <div className="text-gray-900 whitespace-pre-wrap">
                    {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Communication History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Communication History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {form.responses && form.responses.length > 0 ? (
                <div className="space-y-4">
                  {form.responses.map((response, index) => (
                    <div key={response.id} className="border-l-2 border-blue-200 pl-4 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {response.method}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            by {response.respondedBy}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(response.respondedAt)}
                        </div>
                      </div>
                      <div className="text-gray-900 whitespace-pre-wrap">
                        {response.content}
                      </div>
                      {response.attachments && response.attachments.length > 0 && (
                        <div className="mt-2">
                          <Label className="text-xs text-gray-500">Attachments:</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {response.attachments.map((attachment, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {attachment}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No responses yet</p>
                  <p className="text-sm">Be the first to respond to this inquiry</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send Response
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Send Response</DialogTitle>
                    <DialogDescription>
                      Compose a response to {form.customerInfo.name}
                    </DialogDescription>
                  </DialogHeader>
                  <ResponseComposer
                    recipientEmail={form.customerInfo.email}
                    formContext={form}
                    onSend={handleSendResponse}
                    onCancel={() => setIsResponseDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleStatusChange('in_progress')}
                disabled={isUpdatingStatus || form.status === 'in_progress'}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Mark In Progress
              </Button>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleStatusChange('completed')}
                disabled={isUpdatingStatus || form.status === 'completed'}
              >
                <Archive className="h-4 w-4 mr-2" />
                Mark Completed
              </Button>
            </CardContent>
          </Card>

          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Status Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Status</Label>
                <Select
                  value={form.status}
                  onValueChange={handleStatusChange}
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Assigned To</Label>
                <div className="text-sm text-gray-600">
                  {form.assignedTo || "Unassigned"}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <PriorityBadge priority={form.priority} />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-1">
                  {form.tags && form.tags.length > 0 ? (
                    form.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No tags</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add internal notes about this form submission..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
              <Button 
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                size="sm"
                className="w-full"
              >
                {isSavingNotes ? "Saving..." : "Save Notes"}
              </Button>
            </CardContent>
          </Card>

          {/* Form Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Form Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Form ID:</span>
                <span className="font-mono text-xs">{form.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <Badge variant="outline">{formatFormType(form.type)}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Submitted:</span>
                <span>{formatDateTime(form.submittedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span>{formatDateTime(form.lastUpdated)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}