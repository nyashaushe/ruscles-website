import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useForms } from '@/hooks/use-forms'
import { FormSubmission } from '@/lib/types/forms'

// Mock the API
vi.mock('@/lib/api/forms', () => ({
  getForms: vi.fn(),
  updateFormStatus: vi.fn(),
  sendFormResponse: vi.fn(),
  addFormNote: vi.fn(),
  updateFormTags: vi.fn(),
  bulkUpdateForms: vi.fn(),
}))

const mockForms: FormSubmission[] = [
  {
    id: '1',
    type: 'contact',
    submittedAt: new Date('2024-01-15T10:00:00Z'),
    status: 'new',
    priority: 'high',
    customerInfo: {
      name: 'John Doe',
      email: 'john@example.com',
    },
    formData: { message: 'Test message' },
    responses: [],
    tags: ['electrical'],
    notes: '',
    lastUpdated: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: '2',
    type: 'service_inquiry',
    submittedAt: new Date('2024-01-14T15:30:00Z'),
    status: 'in_progress',
    priority: 'medium',
    customerInfo: {
      name: 'Jane Smith',
      email: 'jane@example.com',
    },
    formData: { message: 'HVAC inquiry' },
    responses: [],
    tags: ['hvac'],
    notes: '',
    lastUpdated: new Date('2024-01-14T16:00:00Z'),
  },
]

describe('useForms', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(require('@/lib/api/forms').getForms).mockResolvedValue(mockForms)
  })

  it('fetches forms on mount', async () => {
    const { result } = renderHook(() => useForms())
    
    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.forms).toEqual(mockForms)
    expect(require('@/lib/api/forms').getForms).toHaveBeenCalled()
  })

  it('filters forms by search term', async () => {
    const { result } = renderHook(() => useForms())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    act(() => {
      result.current.setSearchTerm('John')
    })
    
    expect(result.current.filteredForms).toHaveLength(1)
    expect(result.current.filteredForms[0].customerInfo.name).toBe('John Doe')
  })

  it('filters forms by status', async () => {
    const { result } = renderHook(() => useForms())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    act(() => {
      result.current.setStatusFilter('new')
    })
    
    expect(result.current.filteredForms).toHaveLength(1)
    expect(result.current.filteredForms[0].status).toBe('new')
  })

  it('filters forms by priority', async () => {
    const { result } = renderHook(() => useForms())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    act(() => {
      result.current.setPriorityFilter('high')
    })
    
    expect(result.current.filteredForms).toHaveLength(1)
    expect(result.current.filteredForms[0].priority).toBe('high')
  })

  it('sorts forms by date', async () => {
    const { result } = renderHook(() => useForms())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    act(() => {
      result.current.setSortBy('date')
      result.current.setSortOrder('desc')
    })
    
    expect(result.current.filteredForms[0].id).toBe('1') // More recent
    expect(result.current.filteredForms[1].id).toBe('2')
  })

  it('updates form status', async () => {
    vi.mocked(require('@/lib/api/forms').updateFormStatus).mockResolvedValue({
      ...mockForms[0],
      status: 'completed',
    })
    
    const { result } = renderHook(() => useForms())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    await act(async () => {
      await result.current.updateStatus('1', 'completed')
    })
    
    expect(require('@/lib/api/forms').updateFormStatus).toHaveBeenCalledWith('1', 'completed')
  })

  it('sends form response', async () => {
    const responseData = {
      formId: '1',
      content: 'Thank you for your inquiry',
      method: 'email' as const,
    }
    
    vi.mocked(require('@/lib/api/forms').sendFormResponse).mockResolvedValue({
      id: 'r1',
      ...responseData,
      respondedBy: 'admin@example.com',
      respondedAt: new Date(),
      attachments: [],
    })
    
    const { result } = renderHook(() => useForms())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    await act(async () => {
      await result.current.sendResponse(responseData)
    })
    
    expect(require('@/lib/api/forms').sendFormResponse).toHaveBeenCalledWith(responseData)
  })

  it('adds form note', async () => {
    vi.mocked(require('@/lib/api/forms').addFormNote).mockResolvedValue({
      ...mockForms[0],
      notes: 'Updated note',
    })
    
    const { result } = renderHook(() => useForms())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    await act(async () => {
      await result.current.addNote('1', 'Updated note')
    })
    
    expect(require('@/lib/api/forms').addFormNote).toHaveBeenCalledWith('1', 'Updated note')
  })

  it('updates form tags', async () => {
    const newTags = ['electrical', 'urgent']
    vi.mocked(require('@/lib/api/forms').updateFormTags).mockResolvedValue({
      ...mockForms[0],
      tags: newTags,
    })
    
    const { result } = renderHook(() => useForms())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    await act(async () => {
      await result.current.updateTags('1', newTags)
    })
    
    expect(require('@/lib/api/forms').updateFormTags).toHaveBeenCalledWith('1', newTags)
  })

  it('handles bulk actions', async () => {
    vi.mocked(require('@/lib/api/forms').bulkUpdateForms).mockResolvedValue([
      { ...mockForms[0], status: 'completed' },
      { ...mockForms[1], status: 'completed' },
    ])
    
    const { result } = renderHook(() => useForms())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    await act(async () => {
      await result.current.bulkAction('mark_completed', ['1', '2'])
    })
    
    expect(require('@/lib/api/forms').bulkUpdateForms).toHaveBeenCalledWith('mark_completed', ['1', '2'])
  })

  it('handles API errors gracefully', async () => {
    vi.mocked(require('@/lib/api/forms').getForms).mockRejectedValue(new Error('API Error'))
    
    const { result } = renderHook(() => useForms())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.error).toBe('Failed to fetch forms')
    expect(result.current.forms).toEqual([])
  })

  it('refreshes forms data', async () => {
    const { result } = renderHook(() => useForms())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    vi.clearAllMocks()
    
    await act(async () => {
      await result.current.refresh()
    })
    
    expect(require('@/lib/api/forms').getForms).toHaveBeenCalled()
  })

  it('combines multiple filters correctly', async () => {
    const { result } = renderHook(() => useForms())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    act(() => {
      result.current.setSearchTerm('John')
      result.current.setStatusFilter('new')
      result.current.setPriorityFilter('high')
    })
    
    expect(result.current.filteredForms).toHaveLength(1)
    expect(result.current.filteredForms[0].customerInfo.name).toBe('John Doe')
    expect(result.current.filteredForms[0].status).toBe('new')
    expect(result.current.filteredForms[0].priority).toBe('high')
  })

  it('provides form statistics', async () => {
    const { result } = renderHook(() => useForms())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.stats).toEqual({
      total: 2,
      new: 1,
      inProgress: 1,
      completed: 0,
      highPriority: 1,
    })
  })
})