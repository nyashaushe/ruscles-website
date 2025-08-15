import { FormsApi } from './forms'
import type { FormSubmission } from '../types'

export interface UnifiedSubmission {
  id: string
  type: 'form' | 'inquiry'
  source: string // 'contact_form', 'service_inquiry', 'manual_inquiry', etc.
  customerInfo: {
    name: string
    email: string
    phone?: string
    company?: string
  }
  subject: string
  description: string
  status: 'new' | 'pending' | 'in_progress' | 'responded' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  submittedAt: Date
  lastUpdated: Date
  assignedTo?: string
  tags: string[]
  notes: string
  responses: any[]
  metadata: Record<string, any>
}

export class UnifiedSubmissionsApi {
  // Get all submissions (forms + inquiries) with unified interface
  static async getAllSubmissions(
    filters?: {
      status?: string[]
      priority?: string[]
      type?: ('form' | 'inquiry')[]
      search?: string
      dateRange?: { from: Date; to: Date }
    },
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: UnifiedSubmission[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> {
    try {
      const submissions: UnifiedSubmission[] = []

      // Fetch forms if not filtered out
      if (!filters?.type || filters.type.includes('form')) {
        const formFilters = {
          status: filters?.status as FormSubmission['status'][],
          priority: filters?.priority as FormSubmission['priority'][],
          search: filters?.search,
          dateRange: filters?.dateRange
        }

        const formsResponse = await FormsApi.getFormSubmissions(formFilters, page, limit)
        
        if (formsResponse.success) {
          const formSubmissions = formsResponse.data.map(form => this.convertFormToUnified(form))
          submissions.push(...formSubmissions)
        }
      }

      // Fetch inquiries if not filtered out (mock data for now)
      if (!filters?.type || filters.type.includes('inquiry')) {
        const mockInquiries = this.getMockInquiries()
        const inquirySubmissions = mockInquiries.map(inquiry => this.convertInquiryToUnified(inquiry))
        submissions.push(...inquirySubmissions)
      }

      // Apply additional filtering
      let filteredSubmissions = submissions

      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase()
        filteredSubmissions = submissions.filter(sub =>
          sub.customerInfo.name.toLowerCase().includes(searchTerm) ||
          sub.customerInfo.email.toLowerCase().includes(searchTerm) ||
          sub.subject.toLowerCase().includes(searchTerm) ||
          sub.description.toLowerCase().includes(searchTerm)
        )
      }

      if (filters?.status?.length) {
        filteredSubmissions = filteredSubmissions.filter(sub =>
          filters.status!.includes(sub.status)
        )
      }

      if (filters?.priority?.length) {
        filteredSubmissions = filteredSubmissions.filter(sub =>
          filters.priority!.includes(sub.priority)
        )
      }

      if (filters?.dateRange) {
        filteredSubmissions = filteredSubmissions.filter(sub =>
          sub.submittedAt >= filters.dateRange!.from &&
          sub.submittedAt <= filters.dateRange!.to
        )
      }

      // Sort by submission date (most recent first)
      filteredSubmissions.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedSubmissions = filteredSubmissions.slice(startIndex, endIndex)

      return {
        data: paginatedSubmissions,
        pagination: {
          page,
          limit,
          total: filteredSubmissions.length,
          totalPages: Math.ceil(filteredSubmissions.length / limit)
        }
      }
    } catch (error) {
      console.error('Failed to fetch unified submissions:', error)
      throw error
    }
  }

  // Get statistics for both forms and inquiries
  static async getUnifiedStats(): Promise<{
    total: number
    byType: { form: number; inquiry: number }
    byStatus: Record<string, number>
    byPriority: Record<string, number>
    recentCount: number
  }> {
    try {
      const [formsResponse] = await Promise.all([
        FormsApi.getFormStats()
      ])

      // Mock inquiry stats
      const inquiryStats = {
        total: 24,
        byStatus: { pending: 8, 'in-progress': 12, completed: 4 },
        byPriority: { high: 6, medium: 12, low: 6 }
      }

      const formStats = formsResponse.success ? formsResponse.data : {
        total: 0,
        byStatus: {},
        byPriority: {}
      }

      return {
        total: formStats.total + inquiryStats.total,
        byType: {
          form: formStats.total,
          inquiry: inquiryStats.total
        },
        byStatus: {
          new: formStats.byStatus?.new || 0,
          pending: inquiryStats.byStatus.pending,
          in_progress: (formStats.byStatus?.in_progress || 0) + inquiryStats.byStatus['in-progress'],
          responded: formStats.byStatus?.responded || 0,
          completed: (formStats.byStatus?.completed || 0) + inquiryStats.byStatus.completed,
          archived: formStats.byStatus?.archived || 0
        },
        byPriority: {
          urgent: formStats.byPriority?.urgent || 0,
          high: (formStats.byPriority?.high || 0) + inquiryStats.byPriority.high,
          medium: (formStats.byPriority?.medium || 0) + inquiryStats.byPriority.medium,
          low: (formStats.byPriority?.low || 0) + inquiryStats.byPriority.low
        },
        recentCount: formStats.recentCount || 0
      }
    } catch (error) {
      console.error('Failed to fetch unified stats:', error)
      throw error
    }
  }

  private static convertFormToUnified(form: FormSubmission): UnifiedSubmission {
    return {
      id: form.id,
      type: 'form',
      source: form.type,
      customerInfo: form.customerInfo,
      subject: `${form.type.replace('_', ' ')} - ${form.customerInfo.name}`,
      description: form.formData.message || form.formData.description || 'No description provided',
      status: form.status === 'in_progress' ? 'in_progress' : form.status,
      priority: form.priority,
      submittedAt: new Date(form.submittedAt),
      lastUpdated: new Date(form.lastUpdated),
      assignedTo: form.assignedTo,
      tags: form.tags,
      notes: form.notes,
      responses: form.responses,
      metadata: {
        formData: form.formData,
        originalType: form.type
      }
    }
  }

  private static convertInquiryToUnified(inquiry: any): UnifiedSubmission {
    return {
      id: inquiry.id,
      type: 'inquiry',
      source: 'manual_inquiry',
      customerInfo: {
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        company: inquiry.company
      },
      subject: inquiry.service,
      description: inquiry.message || 'Manual inquiry entry',
      status: inquiry.status === 'in-progress' ? 'in_progress' : inquiry.status,
      priority: inquiry.priority,
      submittedAt: new Date(inquiry.date),
      lastUpdated: new Date(inquiry.date),
      assignedTo: inquiry.assignedTo,
      tags: inquiry.tags || [],
      notes: inquiry.notes || '',
      responses: inquiry.responses || [],
      metadata: {
        propertyType: inquiry.propertyType,
        timeline: inquiry.timeline,
        emergency: inquiry.emergency,
        originalService: inquiry.service
      }
    }
  }

  private static getMockInquiries() {
    return [
      {
        id: "INQ-001",
        name: "John Mukamuri",
        email: "john@email.com",
        phone: "+263 77 123 4567",
        service: "Electrical Wiring",
        propertyType: "Residential",
        status: "pending",
        priority: "high",
        date: "2024-01-15",
        message: "Need complete rewiring for 4-bedroom house in Borrowdale",
        timeline: "this-month",
        emergency: true,
      },
      {
        id: "INQ-002",
        name: "Sarah Chikwanha",
        email: "sarah@email.com",
        phone: "+263 77 234 5678",
        service: "Air Conditioning",
        propertyType: "Commercial",
        status: "in-progress",
        priority: "medium",
        date: "2024-01-14",
        message: "AC installation for restaurant in Avondale",
        timeline: "next-week",
        emergency: false,
      },
      {
        id: "INQ-003",
        name: "David Moyo",
        email: "david@email.com",
        phone: "+263 77 345 6789",
        service: "Cold Room Installation",
        propertyType: "Commercial",
        status: "completed",
        priority: "low",
        date: "2024-01-13",
        message: "Cold room for supermarket chain",
        timeline: "flexible",
        emergency: false,
      }
    ]
  }
}