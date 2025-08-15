import type { FormSubmission, FormFilters } from '../types'

export function createFormSubmission(data: any): Omit<FormSubmission, 'id' | 'submittedAt' | 'lastUpdated'> {
  return {
    type: data.type || 'contact',
    status: 'new',
    priority: data.priority || 'medium',
    customerInfo: {
      name: data.name || '',
      email: data.email || '',
      phone: data.phone,
      company: data.company,
    },
    formData: data.formData || {},
    responses: [],
    assignedTo: undefined,
    tags: data.tags || [],
    notes: '',
  }
}

export function filterForms(forms: FormSubmission[], filters: FormFilters): FormSubmission[] {
  return forms.filter(form => {
    // Status filter
    if (filters.status?.length && !filters.status.includes(form.status)) {
      return false
    }
    
    // Priority filter
    if (filters.priority?.length && !filters.priority.includes(form.priority)) {
      return false
    }
    
    // Type filter
    if (filters.type?.length && !filters.type.includes(form.type)) {
      return false
    }
    
    // Assigned to filter
    if (filters.assignedTo && form.assignedTo !== filters.assignedTo) {
      return false
    }
    
    // Date range filter
    if (filters.dateRange) {
      const submittedDate = new Date(form.submittedAt)
      if (submittedDate < filters.dateRange.from || submittedDate > filters.dateRange.to) {
        return false
      }
    }
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const searchableText = [
        form.customerInfo.name,
        form.customerInfo.email,
        form.customerInfo.company,
        form.notes,
        ...form.tags,
        JSON.stringify(form.formData)
      ].join(' ').toLowerCase()
      
      if (!searchableText.includes(searchTerm)) {
        return false
      }
    }
    
    return true
  })
}

export function sortForms(
  forms: FormSubmission[], 
  sortBy: keyof FormSubmission = 'submittedAt', 
  sortOrder: 'asc' | 'desc' = 'desc'
): FormSubmission[] {
  return [...forms].sort((a, b) => {
    let aValue = a[sortBy]
    let bValue = b[sortBy]
    
    // Handle nested properties
    if (sortBy === 'customerInfo') {
      aValue = a.customerInfo.name
      bValue = b.customerInfo.name
    }
    
    // Handle dates
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortOrder === 'desc' 
        ? bValue.getTime() - aValue.getTime()
        : aValue.getTime() - bValue.getTime()
    }
    
    // Handle strings
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue)
      return sortOrder === 'desc' ? -comparison : comparison
    }
    
    // Handle numbers
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
    }
    
    return 0
  })
}

export function getFormPriorityScore(form: FormSubmission): number {
  const priorityScores = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1
  }
  
  let score = priorityScores[form.priority] || 1
  
  // Increase score for older submissions
  const daysSinceSubmission = Math.floor(
    (Date.now() - new Date(form.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
  )
  
  if (daysSinceSubmission > 7) score += 2
  else if (daysSinceSubmission > 3) score += 1
  
  // Increase score for certain form types
  if (form.type === 'quote_request') score += 1
  
  return score
}

export function getOverdueForms(forms: FormSubmission[], daysThreshold: number = 3): FormSubmission[] {
  const thresholdDate = new Date()
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold)
  
  return forms.filter(form => 
    form.status === 'new' && 
    new Date(form.submittedAt) < thresholdDate
  )
}

export function getFormsByAssignee(forms: FormSubmission[]): Record<string, FormSubmission[]> {
  return forms.reduce((acc, form) => {
    const assignee = form.assignedTo || 'unassigned'
    if (!acc[assignee]) {
      acc[assignee] = []
    }
    acc[assignee].push(form)
    return acc
  }, {} as Record<string, FormSubmission[]>)
}