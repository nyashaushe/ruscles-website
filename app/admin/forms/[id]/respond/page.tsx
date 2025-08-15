"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ResponseComposer } from "../../components/response-composer"
import { useForm } from "@/hooks/use-forms"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function FormRespondPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string
  
  const { form, loading, error, sendResponse } = useForm(formId)

  const handleSendResponse = async (responseData: any) => {
    await sendResponse(responseData)
    router.push(`/admin/forms/${formId}`)
  }

  const handleCancel = () => {
    router.push(`/admin/forms/${formId}`)
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
      <EmptyState
        icon={AlertCircle}
        title="Form not found"
        description="The form submission you're looking for doesn't exist or you don't have permission to view it."
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/forms/${formId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Form Details
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Respond to Form #{form.id.slice(-8)}
          </h1>
          <p className="text-gray-600">
            Send a response to {form.customerInfo.name}
          </p>
        </div>
      </div>

      {/* Response Composer */}
      <Card>
        <CardHeader>
          <CardTitle>Compose Response</CardTitle>
          <CardDescription>
            Send a response to the customer's inquiry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponseComposer
            recipientEmail={form.customerInfo.email}
            formContext={form}
            onSend={handleSendResponse}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}