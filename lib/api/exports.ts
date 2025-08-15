import { apiClient, type ApiResponse } from './client'
import type { 
  ExportOptions, 
  FormExportData, 
  ContentExportData, 
  ReportMetrics, 
  ContentAnalytics,
  ExportJob,
  ScheduledReport
} from '../types/exports'
import type { FormFilters } from '../types/forms'
import type { ContentFilters } from '../types/content'

export class ExportsApi {
  // Export form submissions to CSV/JSON
  static async exportForms(
    filters?: FormFilters,
    options: ExportOptions = { format: 'csv' }
  ): Promise<ApiResponse<{ jobId: string }>> {
    return apiClient.post<ApiResponse<{ jobId: string }>>('/exports/forms', {
      filters,
      options
    })
  }

  // Export content items to CSV/JSON
  static async exportContent(
    filters?: ContentFilters,
    options: ExportOptions = { format: 'csv' }
  ): Promise<ApiResponse<{ jobId: string }>> {
    return apiClient.post<ApiResponse<{ jobId: string }>>('/exports/content', {
      filters,
      options
    })
  }

  // Get export job status
  static async getExportJob(jobId: string): Promise<ApiResponse<ExportJob>> {
    return apiClient.get<ApiResponse<ExportJob>>(`/exports/jobs/${jobId}`)
  }

  // Get all export jobs
  static async getExportJobs(): Promise<ApiResponse<ExportJob[]>> {
    return apiClient.get<ApiResponse<ExportJob[]>>('/exports/jobs')
  }

  // Download completed export
  static async downloadExport(jobId: string): Promise<Blob> {
    const response = await fetch(`/api/exports/jobs/${jobId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to download export')
    }

    return response.blob()
  }

  // Get form submission metrics and trends
  static async getFormMetrics(
    dateRange?: { from: Date; to: Date }
  ): Promise<ApiResponse<ReportMetrics>> {
    const params: Record<string, string> = {}
    if (dateRange) {
      params.from = dateRange.from.toISOString()
      params.to = dateRange.to.toISOString()
    }

    return apiClient.get<ApiResponse<ReportMetrics>>('/reports/forms', params)
  }

  // Get content analytics and performance metrics
  static async getContentAnalytics(
    dateRange?: { from: Date; to: Date }
  ): Promise<ApiResponse<ContentAnalytics>> {
    const params: Record<string, string> = {}
    if (dateRange) {
      params.from = dateRange.from.toISOString()
      params.to = dateRange.to.toISOString()
    }

    return apiClient.get<ApiResponse<ContentAnalytics>>('/reports/content', params)
  }

  // Create scheduled report
  static async createScheduledReport(
    report: Omit<ScheduledReport, 'id' | 'createdAt' | 'lastRun' | 'nextRun'>
  ): Promise<ApiResponse<ScheduledReport>> {
    return apiClient.post<ApiResponse<ScheduledReport>>('/reports/scheduled', report)
  }

  // Get scheduled reports
  static async getScheduledReports(): Promise<ApiResponse<ScheduledReport[]>> {
    return apiClient.get<ApiResponse<ScheduledReport[]>>('/reports/scheduled')
  }

  // Update scheduled report
  static async updateScheduledReport(
    id: string,
    updates: Partial<Omit<ScheduledReport, 'id' | 'createdAt'>>
  ): Promise<ApiResponse<ScheduledReport>> {
    return apiClient.patch<ApiResponse<ScheduledReport>>(`/reports/scheduled/${id}`, updates)
  }

  // Delete scheduled report
  static async deleteScheduledReport(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/reports/scheduled/${id}`)
  }

  // Trigger scheduled report manually
  static async runScheduledReport(id: string): Promise<ApiResponse<{ jobId: string }>> {
    return apiClient.post<ApiResponse<{ jobId: string }>>(`/reports/scheduled/${id}/run`, {})
  }

  // Generate CSV from data
  static generateCSV(data: any[], filename: string): void {
    if (!data.length) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value || ''
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Generate JSON export
  static generateJSON(data: any[], filename: string): void {
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Format form data for export
  static formatFormDataForExport(forms: any[]): FormExportData[] {
    return forms.map(form => ({
      id: form.id,
      type: form.type,
      submittedAt: new Date(form.submittedAt).toISOString(),
      status: form.status,
      priority: form.priority,
      customerName: form.customerInfo.name,
      customerEmail: form.customerInfo.email,
      customerPhone: form.customerInfo.phone || '',
      customerCompany: form.customerInfo.company || '',
      assignedTo: form.assignedTo || '',
      tags: form.tags.join(', '),
      notes: form.notes,
      lastUpdated: new Date(form.lastUpdated).toISOString(),
      responseCount: form.responses?.length || 0,
      firstResponseAt: form.responses?.length ? new Date(form.responses[0].respondedAt).toISOString() : '',
      lastResponseAt: form.responses?.length ? new Date(form.responses[form.responses.length - 1].respondedAt).toISOString() : '',
      formData: form.formData
    }))
  }

  // Format content data for export
  static formatContentDataForExport(content: any[]): ContentExportData[] {
    return content.map(item => ({
      id: item.id,
      type: item.type,
      title: item.title,
      slug: item.slug,
      status: item.status,
      author: item.author,
      createdAt: new Date(item.createdAt).toISOString(),
      updatedAt: new Date(item.updatedAt).toISOString(),
      publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString() : '',
      tags: item.tags?.join(', ') || '',
      categories: item.categories?.join(', ') || '',
      viewCount: item.viewCount || 0,
      engagementScore: item.engagementScore || 0
    }))
  }
}