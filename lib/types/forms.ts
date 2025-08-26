export interface FormSubmission {
  id: string
  type: 'contact' | 'service_inquiry' | 'quote_request'
  submittedAt: Date
  status: 'new' | 'in_progress' | 'responded' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  subject?: string
  message: string
  customerInfo: {
    name: string
    email: string
    phone?: string
    company?: string
  }
  formData: Record<string, any>
  responses: FormResponse[]
  assignedTo?: string
  tags: string[]
  notes: string
  lastUpdated: Date
}

export interface FormResponse {
  id: string
  formId: string
  respondedBy: string
  respondedAt: Date
  method: 'email' | 'phone' | 'in_person'
  content: string
  attachments?: string[]
}

export interface FormFilters {
  status?: FormSubmission['status'][]
  priority?: FormSubmission['priority'][]
  type?: FormSubmission['type'][]
  dateRange?: {
    from: Date
    to: Date
  }
  assignedTo?: string
  search?: string
  tags?: string[]
}

export interface ResponseData {
  content: string
  method: FormResponse['method']
  attachments?: File[]
  scheduleFollowUp?: Date
}