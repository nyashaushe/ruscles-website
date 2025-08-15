import type { FormSubmission, ContentItem } from '../types'

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    // Form statuses
    new: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-orange-100 text-orange-800',
    responded: 'bg-green-100 text-green-800',
    completed: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
    
    // Content statuses
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-green-100 text-green-800',
    scheduled: 'bg-blue-100 text-blue-800',
  }
  
  return statusColors[status] || 'bg-gray-100 text-gray-800'
}

export function getPriorityColor(priority: string): string {
  const priorityColors: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  }
  
  return priorityColors[priority] || 'bg-gray-100 text-gray-800'
}

export function formatFormType(type: FormSubmission['type']): string {
  const typeLabels: Record<FormSubmission['type'], string> = {
    contact: 'Contact Form',
    service_inquiry: 'Service Inquiry',
    quote_request: 'Quote Request',
  }
  
  return typeLabels[type] || type
}

export function formatServiceCategory(category: string): string {
  const categoryLabels: Record<string, string> = {
    electrical: 'Electrical Services',
    hvac: 'HVAC Services',
    refrigeration: 'Refrigeration Services',
  }
  
  return categoryLabels[category] || category
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function generateExcerpt(content: string, maxLength: number = 160): string {
  // Remove HTML tags and get plain text
  const plainText = content.replace(/<[^>]*>/g, '').trim()
  return truncateText(plainText, maxLength)
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}