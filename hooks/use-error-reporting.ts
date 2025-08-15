'use client'

import { useCallback, useEffect, useState } from 'react'
import { 
  logError, 
  getErrorLogs, 
  getErrorStats, 
  clearErrorLogs,
  ErrorLogEntry,
  getContextualErrorMessage 
} from '@/lib/utils/error-handling'
import { useToast } from './use-toast'

export interface ErrorReportingOptions {
  showToastOnError?: boolean
  autoReportCriticalErrors?: boolean
  maxErrorsToStore?: number
  enableConsoleLogging?: boolean
}

export function useErrorReporting(options: ErrorReportingOptions = {}) {
  const {
    showToastOnError = true,
    autoReportCriticalErrors = true,
    maxErrorsToStore = 100,
    enableConsoleLogging = process.env.NODE_ENV === 'development'
  } = options

  const { toast } = useToast()
  const [errorStats, setErrorStats] = useState(getErrorStats())

  // Report an error with context
  const reportError = useCallback((
    error: any,
    context?: Record<string, any>,
    userMessage?: string
  ) => {
    const errorId = logError(error, context)
    
    // Show toast notification if enabled
    if (showToastOnError) {
      const message = userMessage || getContextualErrorMessage(error, context?.context || 'general')
      
      toast({
        title: 'Error Occurred',
        description: message,
        variant: 'destructive',
      })
    }

    // Log to console if enabled
    if (enableConsoleLogging) {
      console.error('Error reported:', { errorId, error, context, userMessage })
    }

    // Update stats
    setErrorStats(getErrorStats())

    return errorId
  }, [showToastOnError, enableConsoleLogging, toast])

  // Report a validation error
  const reportValidationError = useCallback((
    field: string,
    value: any,
    validationError: string,
    formContext?: Record<string, any>
  ) => {
    return reportError(
      new Error(`Validation failed for field '${field}': ${validationError}`),
      {
        context: 'validation_error',
        field,
        value,
        validationError,
        ...formContext
      },
      `Please check the ${field} field: ${validationError}`
    )
  }, [reportError])

  // Report a network error
  const reportNetworkError = useCallback((
    error: any,
    endpoint: string,
    method: string = 'GET',
    requestData?: any
  ) => {
    return reportError(
      error,
      {
        context: 'network_error',
        endpoint,
        method,
        requestData
      },
      getContextualErrorMessage(error, 'network_request')
    )
  }, [reportError])

  // Report a form submission error
  const reportFormError = useCallback((
    error: any,
    formName: string,
    formData?: Record<string, any>
  ) => {
    return reportError(
      error,
      {
        context: 'form_submission_error',
        formName,
        formData
      },
      getContextualErrorMessage(error, 'form_submission')
    )
  }, [reportError])

  // Report a file upload error
  const reportFileUploadError = useCallback((
    error: any,
    fileName: string,
    fileSize: number,
    fileType: string
  ) => {
    return reportError(
      error,
      {
        context: 'file_upload_error',
        fileName,
        fileSize,
        fileType
      },
      getContextualErrorMessage(error, 'file_upload')
    )
  }, [reportError])

  // Report a critical error that needs immediate attention
  const reportCriticalError = useCallback((
    error: any,
    context?: Record<string, any>,
    userMessage?: string
  ) => {
    const errorId = reportError(error, { ...context, severity: 'critical' }, userMessage)

    // Show more prominent notification for critical errors
    toast({
      title: 'Critical Error',
      description: userMessage || 'A critical error occurred. Please contact support if this persists.',
      variant: 'destructive',
      duration: 10000, // Show longer for critical errors
    })

    // Auto-report to monitoring service if enabled
    if (autoReportCriticalErrors) {
      // In a real app, this would send to a monitoring service
      console.error('CRITICAL ERROR REPORTED:', { errorId, error, context })
    }

    return errorId
  }, [reportError, autoReportCriticalErrors, toast])

  // Get error statistics
  const getStats = useCallback(() => {
    return getErrorStats()
  }, [])

  // Get recent errors
  const getRecentErrors = useCallback((limit: number = 10): ErrorLogEntry[] => {
    const logs = getErrorLogs()
    return logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }, [])

  // Clear all error logs
  const clearAllErrors = useCallback(() => {
    clearErrorLogs()
    setErrorStats(getErrorStats())
    
    toast({
      title: 'Error logs cleared',
      description: 'All error logs have been cleared successfully.',
    })
  }, [toast])

  // Export error logs
  const exportErrorLogs = useCallback(() => {
    const logs = getErrorLogs()
    const dataStr = JSON.stringify(logs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: 'Error logs exported',
      description: 'Error logs have been downloaded successfully.',
    })
  }, [toast])

  // Check for error patterns
  const checkErrorPatterns = useCallback(() => {
    const logs = getErrorLogs()
    const now = Date.now()
    const oneHourAgo = now - (60 * 60 * 1000)
    const recentErrors = logs.filter(log => new Date(log.timestamp).getTime() > oneHourAgo)

    // Check for error spikes
    if (recentErrors.length > 10) {
      toast({
        title: 'High Error Rate Detected',
        description: `${recentErrors.length} errors in the last hour. Consider checking system health.`,
        variant: 'destructive',
      })
    }

    // Check for repeated errors
    const errorCounts: Record<string, number> = {}
    recentErrors.forEach(error => {
      const key = `${error.message}_${error.category}`
      errorCounts[key] = (errorCounts[key] || 0) + 1
    })

    const repeatedErrors = Object.entries(errorCounts).filter(([_, count]) => count >= 3)
    if (repeatedErrors.length > 0) {
      toast({
        title: 'Repeated Errors Detected',
        description: `Some errors are occurring repeatedly. Check the error monitoring dashboard.`,
        variant: 'destructive',
      })
    }

    return {
      totalRecent: recentErrors.length,
      repeatedErrors: repeatedErrors.length,
      criticalErrors: recentErrors.filter(e => e.severity === 'critical').length
    }
  }, [toast])

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setErrorStats(getErrorStats())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Cleanup old errors periodically
  useEffect(() => {
    const cleanup = () => {
      const logs = getErrorLogs()
      if (logs.length > maxErrorsToStore) {
        const sortedLogs = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        const trimmedLogs = sortedLogs.slice(0, maxErrorsToStore)
        localStorage.setItem('error_logs', JSON.stringify(trimmedLogs))
        setErrorStats(getErrorStats())
      }
    }

    const interval = setInterval(cleanup, 5 * 60 * 1000) // Cleanup every 5 minutes
    return () => clearInterval(interval)
  }, [maxErrorsToStore])

  return {
    // Error reporting functions
    reportError,
    reportValidationError,
    reportNetworkError,
    reportFormError,
    reportFileUploadError,
    reportCriticalError,

    // Data access functions
    getStats,
    getRecentErrors,
    errorStats,

    // Management functions
    clearAllErrors,
    exportErrorLogs,
    checkErrorPatterns,

    // Computed properties
    hasErrors: errorStats.total > 0,
    hasRecentErrors: errorStats.recent > 0,
    hasCriticalErrors: (errorStats.bySeverity.critical || 0) > 0,
  }
}

// Global error handler hook for unhandled errors
export function useGlobalErrorHandler() {
  const { reportCriticalError } = useErrorReporting()

  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportCriticalError(
        event.reason,
        { context: 'unhandled_promise_rejection' },
        'An unexpected error occurred. The application may not function correctly.'
      )
    }

    // Handle global JavaScript errors
    const handleGlobalError = (event: ErrorEvent) => {
      reportCriticalError(
        new Error(event.message),
        { 
          context: 'global_javascript_error',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        },
        'A critical JavaScript error occurred. Please refresh the page.'
      )
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleGlobalError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleGlobalError)
    }
  }, [reportCriticalError])
}