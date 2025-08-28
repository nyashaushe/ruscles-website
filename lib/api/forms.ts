import type { FormSubmission, FormResponse, FormFilters, ResponseData } from '../types'

// Simple API client for forms
const apiBase = '/api'

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBase}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`)
  }

  return response.json()
}

export class FormsApi {
  // Delete form submission by ID
  static async deleteFormSubmission(id: string): Promise<{ success: boolean }> {
    return apiRequest(`/forms/${id}`, {
      method: 'DELETE',
    });
  }
  // Get all form submissions with filtering and pagination
  static async getFormSubmissions(
    filters?: FormFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ success: boolean; data: FormSubmission[]; pagination: any }> {
    const params: Record<string, any> = { page, limit }

    if (filters) {
      if (filters.status?.length) {
        params.status = filters.status.join(',');
      }
      if (filters.priority?.length) params.priority = filters.priority.join(',')
      if (filters.type?.length) params.type = filters.type.join(',')
      if (filters.assignedTo) params.assignedTo = filters.assignedTo
      if (filters.search) params.search = filters.search
      if (filters.dateRange) {
        params.dateFrom = filters.dateRange.from.toISOString()
        params.dateTo = filters.dateRange.to.toISOString()
      }
    }

    const searchParams = new URLSearchParams(params).toString()
    return apiRequest(`/forms?${searchParams}`)
  }

  // Get a specific form submission by ID
  static async getFormSubmission(id: string): Promise<{ success: boolean; data: FormSubmission }> {
    return apiRequest(`/forms/${id}`)
  }

  // Get form by ID (alias for compatibility)
  static async getFormById(id: string): Promise<FormSubmission> {
    const result = await this.getFormSubmission(id)
    return result.data
  }

  // Update form submission status and notes
  static async updateFormSubmission(
    id: string,
    updates: Partial<Pick<FormSubmission, 'status' | 'priority' | 'assignedTo' | 'notes' | 'tags'>>
  ): Promise<{ success: boolean; data: FormSubmission }> {
    return apiRequest(`/forms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  // Update form (alias for compatibility)
  static async updateForm(
    id: string,
    updates: Partial<Pick<FormSubmission, 'status' | 'priority' | 'assignedTo' | 'notes' | 'tags'>>
  ): Promise<FormSubmission> {
    const result = await this.updateFormSubmission(id, updates)
    return result.data
  }

  // Send response to form submission
  static async sendResponse(
    formId: string,
    responseData: ResponseData
  ): Promise<{ success: boolean; data: FormResponse }> {
    const formData = new FormData()
    formData.append('content', responseData.content)
    formData.append('method', responseData.method)

    if (responseData.scheduleFollowUp) {
      formData.append('scheduleFollowUp', responseData.scheduleFollowUp.toISOString())
    }

    if (responseData.attachments?.length) {
      responseData.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file)
      })
    }

    return apiRequest(`/forms/${formId}/respond`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    })
  }

  // Send form response (alternative interface)
  static async sendFormResponse(
    formId: string,
    responseData: {
      to: string
      subject: string
      message: string
      template?: string
      priority?: string
      sendCopy?: boolean
      scheduleFor?: Date | null
    }
  ): Promise<void> {
    await apiRequest(`/forms/${formId}/respond`, {
      method: 'POST',
      body: JSON.stringify(responseData),
    })
  }

  // Save draft response
  static async saveDraftResponse(
    formId: string,
    responseData: any
  ): Promise<void> {
    await apiRequest(`/forms/${formId}/draft`, {
      method: 'POST',
      body: JSON.stringify(responseData),
    })
  }

  // Get form responses for a specific submission
  static async getFormResponses(formId: string): Promise<{ success: boolean; data: FormResponse[] }> {
    return apiRequest(`/forms/${formId}/responses`)
  }

  // Archive form submission
  static async archiveFormSubmission(id: string): Promise<{ success: boolean }> {
    return apiRequest(`/forms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'archived' }),
    })
  }

  // Get form statistics
  static async getFormStats(): Promise<{ success: boolean; data: any }> {
    return apiRequest('/forms/stats')
  }

  // Bulk update form submissions
  static async bulkUpdateForms(
    formIds: string[],
    updates: Partial<Pick<FormSubmission, 'status' | 'priority' | 'assignedTo' | 'tags' | 'notes'>>
  ): Promise<{ success: boolean }> {
    return apiRequest('/forms/bulk', {
      method: 'PATCH',
      body: JSON.stringify({
        formIds,
        updates
      }),
    })
  }

  // Submit a new form (for testing purposes)
  static async submitForm(formData: {
    type: FormSubmission['type']
    customerInfo: any
    formData: any
    priority?: FormSubmission['priority']
  }): Promise<{ success: boolean; data: FormSubmission }> {
    return apiRequest('/forms', {
      method: 'POST',
      body: JSON.stringify(formData),
    })
  }
}