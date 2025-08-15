"use client"

import { useEffect, useCallback, useRef } from 'react'
import type { FormSubmission } from '@/lib/types'

interface RealtimeFormsOptions {
  onNewSubmission?: (form: FormSubmission) => void
  onFormUpdate?: (form: FormSubmission) => void
  onFormResponse?: (formId: string, responseId: string) => void
  pollingInterval?: number // in milliseconds, default 30 seconds
}

export function useRealtimeForms({
  onNewSubmission,
  onFormUpdate,
  onFormResponse,
  pollingInterval = 30000
}: RealtimeFormsOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastCheckRef = useRef<Date>(new Date())

  const checkForUpdates = useCallback(async () => {
    try {
      // In a real implementation, this would call an API endpoint
      // that returns updates since the last check timestamp
      const response = await fetch(`/api/admin/forms/updates?since=${lastCheckRef.current.toISOString()}`)
      
      if (response.ok) {
        const updates = await response.json()
        
        // Process new submissions
        if (updates.newSubmissions?.length && onNewSubmission) {
          updates.newSubmissions.forEach((form: FormSubmission) => {
            onNewSubmission(form)
          })
        }
        
        // Process form updates
        if (updates.updatedForms?.length && onFormUpdate) {
          updates.updatedForms.forEach((form: FormSubmission) => {
            onFormUpdate(form)
          })
        }
        
        // Process new responses
        if (updates.newResponses?.length && onFormResponse) {
          updates.newResponses.forEach((response: any) => {
            onFormResponse(response.formId, response.id)
          })
        }
        
        lastCheckRef.current = new Date()
      }
    } catch (error) {
      console.error('Failed to check for form updates:', error)
    }
  }, [onNewSubmission, onFormUpdate, onFormResponse])

  useEffect(() => {
    // Start polling for updates
    intervalRef.current = setInterval(checkForUpdates, pollingInterval)
    
    // Initial check
    checkForUpdates()
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [checkForUpdates, pollingInterval])

  const startPolling = useCallback(() => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(checkForUpdates, pollingInterval)
    }
  }, [checkForUpdates, pollingInterval])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  return {
    startPolling,
    stopPolling,
    checkForUpdates
  }
}