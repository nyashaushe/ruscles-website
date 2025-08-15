"use client"

import { useState, useEffect, useCallback } from 'react'
import { FormsApi } from '@/lib/api/forms'
import type { FormSubmission, FormFilters, ResponseData } from '@/lib/types'

export function useForms(initialFilters?: FormFilters, initialPage: number = 1) {
  const [forms, setForms] = useState<FormSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FormFilters>(initialFilters || {})
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  const fetchForms = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await FormsApi.getFormSubmissions(
        filters, 
        pagination.page, 
        pagination.limit
      )
      
      if (response.success) {
        setForms(response.data)
        setPagination(response.pagination)
      } else {
        setError('Failed to fetch forms')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page, pagination.limit])

  useEffect(() => {
    fetchForms()
  }, [fetchForms])

  const updateFilters = useCallback((newFilters: FormFilters) => {
    setFilters(newFilters)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }, [])

  const updatePage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }, [])

  const refreshForms = useCallback(() => {
    fetchForms()
  }, [fetchForms])

  return {
    forms,
    loading,
    error,
    filters,
    pagination,
    updateFilters,
    updatePage,
    refreshForms
  }
}

export function useForm(formId: string) {
  const [form, setForm] = useState<FormSubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchForm = useCallback(async () => {
    if (!formId) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await FormsApi.getFormSubmission(formId)
      
      if (response.success) {
        setForm(response.data)
      } else {
        setError('Failed to fetch form submission')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [formId])

  useEffect(() => {
    fetchForm()
  }, [fetchForm])

  const updateFormStatus = useCallback(async (status: FormSubmission['status']) => {
    if (!form) return

    try {
      const response = await FormsApi.updateFormSubmission(form.id, { status })
      
      if (response.success) {
        setForm(response.data)
        return response.data
      } else {
        throw new Error('Failed to update form status')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update form status')
      throw err
    }
  }, [form])

  const sendResponse = useCallback(async (responseData: ResponseData) => {
    if (!form) return

    try {
      const response = await FormsApi.sendResponse(form.id, responseData)
      
      if (response.success) {
        // Refresh the form to get updated responses
        await fetchForm()
        return response.data
      } else {
        throw new Error('Failed to send response')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send response')
      throw err
    }
  }, [form, fetchForm])

  return {
    form,
    loading,
    error,
    updateFormStatus,
    sendResponse,
    refreshForm: fetchForm
  }
}

export function useFormStats() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await FormsApi.getFormStats()
        
        if (response.success) {
          setStats(response.data)
        } else {
          setError('Failed to fetch form statistics')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}