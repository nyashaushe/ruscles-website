"use client"

import { useParams } from "next/navigation"
import { FormDetailView } from "../components/form-detail-view"
import { useForm } from "@/hooks/use-forms"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { AlertCircle } from "lucide-react"

export default function FormDetailPage() {
  const params = useParams()
  const formId = params.id as string
  
  const { form, loading, error, updateFormStatus, sendResponse } = useForm(formId)

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
    <FormDetailView
      form={form}
      onStatusChange={updateFormStatus}
      onSendResponse={sendResponse}
    />
  )
}