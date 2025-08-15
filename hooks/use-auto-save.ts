import { useEffect, useRef, useCallback } from 'react'
import { useToast } from './use-toast'

interface UseAutoSaveOptions<T> {
  data: T
  onSave: (data: T) => Promise<void>
  delay?: number
  enabled?: boolean
  onSaveSuccess?: () => void
  onSaveError?: (error: Error) => void
}

interface UseAutoSaveReturn {
  isSaving: boolean
  lastSaved: Date | null
  forceSave: () => Promise<void>
}

export function useAutoSave<T>({
  data,
  onSave,
  delay = 30000, // 30 seconds default
  enabled = true,
  onSaveSuccess,
  onSaveError,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const { toast } = useToast()
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastDataRef = useRef<T>(data)
  const isSavingRef = useRef(false)
  const lastSavedRef = useRef<Date | null>(null)

  const save = useCallback(async () => {
    if (isSavingRef.current) return

    try {
      isSavingRef.current = true
      await onSave(data)
      lastSavedRef.current = new Date()
      lastDataRef.current = data
      onSaveSuccess?.()
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Auto-save failed')
      onSaveError?.(err)
      toast({
        title: "Auto-save failed",
        description: "Your changes may not be saved. Please save manually.",
        variant: "destructive",
      })
    } finally {
      isSavingRef.current = false
    }
  }, [data, onSave, onSaveSuccess, onSaveError, toast])

  const forceSave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    await save()
  }, [save])

  useEffect(() => {
    if (!enabled) return

    // Check if data has changed
    const hasChanged = JSON.stringify(data) !== JSON.stringify(lastDataRef.current)
    
    if (!hasChanged) return

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      save()
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, delay, enabled, save])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    isSaving: isSavingRef.current,
    lastSaved: lastSavedRef.current,
    forceSave,
  }
}

// Hook for showing auto-save status
export function useAutoSaveStatus(lastSaved: Date | null, isSaving: boolean) {
  const getStatusText = useCallback(() => {
    if (isSaving) return 'Saving...'
    if (lastSaved) {
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - lastSaved.getTime()) / 1000)
      
      if (diffInSeconds < 60) return 'Saved just now'
      if (diffInSeconds < 3600) return `Saved ${Math.floor(diffInSeconds / 60)} minutes ago`
      return `Saved ${Math.floor(diffInSeconds / 3600)} hours ago`
    }
    return 'Not saved'
  }, [lastSaved, isSaving])

  const getStatusColor = useCallback(() => {
    if (isSaving) return 'text-blue-600'
    if (lastSaved) {
      const now = new Date()
      const diffInMinutes = Math.floor((now.getTime() - lastSaved.getTime()) / 60000)
      
      if (diffInMinutes < 2) return 'text-green-600'
      if (diffInMinutes < 10) return 'text-yellow-600'
      return 'text-red-600'
    }
    return 'text-gray-500'
  }, [lastSaved, isSaving])

  return {
    statusText: getStatusText(),
    statusColor: getStatusColor(),
  }
}