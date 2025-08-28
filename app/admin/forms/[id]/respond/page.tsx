"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Send,
  Save,
  Eye,
  MessageSquare,
  Mail,
  Clock,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { FormsApi } from "@/lib/api/forms"
import { StatusBadge } from "@/components/ui/status-badge"
import { PriorityBadge } from "@/components/ui/priority-badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { formatRelativeTime } from "@/lib/utils"
import { ResponseComposer } from "../../components/response-composer"
import { EmailTemplates } from "../../components/email-templates"
import { useToast } from "@/hooks/use-toast"
import type { FormSubmission } from "@/lib/types"

export default function FormResponsePage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string
  const { toast } = useToast()

  const [form, setForm] = useState<FormSubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [responseData, setResponseData] = useState({
    to: '',
    subject: '',
    message: '',
    template: '',
    priority: 'normal' as 'low' | 'normal' | 'high',
    sendCopy: false,
    scheduleFor: null as Date | null
  })

  useEffect(() => {
    loadFormDetails()
  }, [formId])

  const loadFormDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await FormsApi.getFormById(formId)
      setForm(response)

      // Pre-populate response fields
      setResponseData(prev => ({
        ...prev,
        to: response.customerInfo.email,
        subject: `Re: ${response.subject || 'Your inquiry'}`
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load form details')
    } finally {
      setLoading(false)
    }
  }

  const handleSendResponse = async () => {
    if (!form || !responseData.message.trim()) return

    try {
      setSending(true)
      setError(null)
      setSuccess(null)

      // Send the response
      const response = await FormsApi.sendFormResponse(form.id, {
        to: responseData.to,
        subject: responseData.subject,
        message: responseData.message,
        template: responseData.template,
        priority: responseData.priority,
        sendCopy: responseData.sendCopy,
        scheduleFor: responseData.scheduleFor
      })

      // Update form status to responded
      await FormsApi.updateForm(form.id, {
        status: 'responded',
        assignedTo: 'Current User' // This would be the actual current user
      })

      // Show success toast
      toast({
        title: "✅ Response Sent Successfully!",
        description: `Your response has been sent to ${responseData.to}. The form status has been updated to "Responded".`,
        variant: "default",
      })

      // Show success message in UI as well
      setSuccess(`Response sent successfully to ${responseData.to}! The form status has been updated to "Responded".`)

      // Clear the form
      setResponseData(prev => ({
        ...prev,
        message: '',
        template: ''
      }))

      // Redirect back to form details after a short delay
      setTimeout(() => {
        router.push(`/admin/forms/${form.id}`)
      }, 2000)

    } catch (err) {
      console.error('Failed to send response:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to send response'
      setError(errorMessage)

      // Show error toast
      toast({
        title: "❌ Failed to Send Response",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!form) return

    try {
      await FormsApi.saveDraftResponse(form.id, responseData)
      // Show success message
    } catch (err) {
      console.error('Failed to save draft:', err)
    }
  }

  const handleTemplateSelect = (template: string, content: string) => {
    setResponseData(prev => ({
      ...prev,
      template,
      message: content
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/forms">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forms
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Error loading form: {error}</p>
              <Button onClick={loadFormDetails} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/forms/${form.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Details
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Respond to Form
            </h1>
            <p className="text-gray-600 mt-1">
              Responding to {form.customerInfo.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={handleSendResponse}
            disabled={sending || !responseData.message.trim()}
          >
            {sending ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Sending...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Response
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Original Form Content */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Original Inquiry</CardTitle>
              <div className="flex items-center gap-2">
                <StatusBadge status={form.status} />
                <PriorityBadge priority={form.priority} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">From</Label>
                <div className="mt-1">
                  <p className="font-medium">{form.customerInfo.name}</p>
                  <p className="text-sm text-gray-600">{form.customerInfo.email}</p>
                  {form.customerInfo.company && (
                    <p className="text-sm text-gray-500">{form.customerInfo.company}</p>
                  )}
                </div>
              </div>

              {form.subject && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Subject</Label>
                  <p className="mt-1 text-gray-900">{form.subject}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-gray-600">Message</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded border text-sm">
                  <p className="whitespace-pre-wrap">{form.message}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Submitted</Label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatRelativeTime(form.submittedAt)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Email Templates */}
          <EmailTemplates
            onTemplateSelect={handleTemplateSelect}
            formType={form.type}
          />
        </div>

        {/* Response Composer */}
        <div className="lg:col-span-2">
          <ResponseComposer
            responseData={responseData}
            onDataChange={setResponseData}
            form={form}
          />
        </div>
      </div>

      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center text-green-700">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5" />
                <p className="font-medium">Success!</p>
              </div>
              <p className="text-sm">{success}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center text-red-700">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}