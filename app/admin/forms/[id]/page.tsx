"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  MessageSquare, 
  User, 
  Clock, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Edit,
  Archive,
  Download
} from "lucide-react"
import Link from "next/link"
import { FormsApi } from "@/lib/api/forms"
import { StatusBadge } from "@/components/ui/status-badge"
import { PriorityBadge } from "@/components/ui/priority-badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { formatRelativeTime, formatFormType } from "@/lib/utils"
import type { FormSubmission } from "@/lib/types"

export default function FormDetailPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string

  const [form, setForm] = useState<FormSubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadFormDetails()
  }, [formId])

  const loadFormDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await FormsApi.getFormById(formId)
      setForm(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load form details')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: FormSubmission['status']) => {
    if (!form) return

    try {
      setUpdating(true)
      await FormsApi.updateForm(form.id, { status: newStatus })
      setForm({ ...form, status: newStatus })
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setUpdating(false)
    }
  }

  const handleAssignment = async (assignedTo: string) => {
    if (!form) return

    try {
      setUpdating(true)
      await FormsApi.updateForm(form.id, { assignedTo })
      setForm({ ...form, assignedTo })
    } catch (err) {
      console.error('Failed to assign form:', err)
    } finally {
      setUpdating(false)
    }
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
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Form Not Found</p>
              <p className="text-gray-600 mb-4">
                {error || 'The requested form could not be found.'}
              </p>
              <Button onClick={loadFormDetails}>
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
            <Link href="/admin/forms">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forms
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Form Submission Details
            </h1>
            <p className="text-gray-600 mt-1">
              Submitted {formatRelativeTime(form.submittedAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
          <Button size="sm" asChild>
            <Link href={`/admin/forms/${form.id}/respond`}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Respond
            </Link>
          </Button>
        </div>
      </div>

      {/* Status and Priority Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <StatusBadge status={form.status} />
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusUpdate(
                  form.status === 'new' ? 'in_progress' :
                  form.status === 'in_progress' ? 'completed' : 'new'
                )}
                disabled={updating}
                className="text-xs"
              >
                {updating ? <LoadingSpinner size="sm" /> : 'Update Status'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <PriorityBadge priority={form.priority} />
            <p className="text-xs text-gray-600 mt-1">
              {form.priority === 'urgent' ? 'Requires immediate attention' :
               form.priority === 'high' ? 'High priority inquiry' :
               form.priority === 'medium' ? 'Standard priority' : 'Low priority'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Type</CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <Badge variant="outline">
              {formatFormType(form.type)}
            </Badge>
            <p className="text-xs text-gray-600 mt-1">Form category</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Assigned To</CardTitle>
            <User className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            {form.assignedTo ? (
              <div>
                <p className="font-medium">{form.assignedTo}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAssignment('')}
                  disabled={updating}
                  className="text-xs mt-1"
                >
                  Unassign
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 text-sm">Unassigned</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAssignment('Current User')}
                  disabled={updating}
                  className="text-xs mt-1"
                >
                  Assign to Me
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
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
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-gray-900 font-medium">{form.customerInfo.name}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a 
                      href={`mailto:${form.customerInfo.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {form.customerInfo.email}
                    </a>
                  </div>
                </div>
                {form.customerInfo.phone && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a 
                        href={`tel:${form.customerInfo.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {form.customerInfo.phone}
                      </a>
                    </div>
                  </div>
                )}
                {form.customerInfo.company && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Company</label>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{form.customerInfo.company}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Form Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Message Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              {form.subject && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-600">Subject</label>
                  <p className="text-gray-900 font-medium mt-1">{form.subject}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Message</label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{form.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          {form.formData && Object.keys(form.formData).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>Custom form fields and data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(form.formData).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <p className="text-gray-900">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Submitted At</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">
                      {new Date(form.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Form ID</label>
                  <p className="text-gray-900 font-mono text-sm">{form.id}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Source</label>
                  <p className="text-gray-900">Website Contact Form</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>Track of all changes and interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Form submitted</p>
                    <p className="text-sm text-gray-600">
                      Customer submitted the form via website
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatRelativeTime(form.submittedAt)}
                    </p>
                  </div>
                </div>
                {/* Additional history items would be added here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
              <CardDescription>Files and documents related to this form</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">No files attached to this form</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}