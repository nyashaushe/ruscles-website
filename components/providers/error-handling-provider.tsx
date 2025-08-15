'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { ErrorNotification, useErrorNotification } from '@/components/ui/error-notification'
import { useErrorReporting, useGlobalErrorHandler } from '@/hooks/use-error-reporting'
import { initializeErrorMonitoring, ErrorMonitoringService } from '@/lib/api/error-monitoring'
import { Toaster } from '@/components/ui/toaster'

interface ErrorHandlingContextValue {
  reportError: (error: any, context?: Record<string, any>, userMessage?: string) => string
  reportValidationError: (field: string, value: any, validationError: string, formContext?: Record<string, any>) => string
  reportNetworkError: (error: any, endpoint: string, method?: string, requestData?: any) => string
  reportFormError: (error: any, formName: string, formData?: Record<string, any>) => string
  reportFileUploadError: (error: any, fileName: string, fileSize: number, fileType: string) => string
  reportCriticalError: (error: any, context?: Record<string, any>, userMessage?: string) => string
  showErrorNotification: (error: any, props?: any) => string
  clearAllNotifications: () => void
  errorStats: any
  hasErrors: boolean
  hasRecentErrors: boolean
  hasCriticalErrors: boolean
}

const ErrorHandlingContext = createContext<ErrorHandlingContextValue | null>(null)

export function useErrorHandling() {
  const context = useContext(ErrorHandlingContext)
  if (!context) {
    throw new Error('useErrorHandling must be used within an ErrorHandlingProvider')
  }
  return context
}

interface ErrorHandlingProviderProps {
  children: React.ReactNode
  enableGlobalErrorHandler?: boolean
  enableErrorMonitoring?: boolean
  errorMonitoringConfig?: any
  showErrorNotifications?: boolean
}

export function ErrorHandlingProvider({
  children,
  enableGlobalErrorHandler = true,
  enableErrorMonitoring = true,
  errorMonitoringConfig,
  showErrorNotifications = true
}: ErrorHandlingProviderProps) {
  const [errorMonitoring, setErrorMonitoring] = useState<ErrorMonitoringService | null>(null)
  
  // Initialize error reporting
  const errorReporting = useErrorReporting({
    showToastOnError: showErrorNotifications,
    autoReportCriticalErrors: true,
    enableConsoleLogging: process.env.NODE_ENV === 'development'
  })

  // Initialize error notifications
  const errorNotifications = useErrorNotification()

  // Initialize global error handler
  if (enableGlobalErrorHandler) {
    useGlobalErrorHandler()
  }

  // Initialize error monitoring service
  useEffect(() => {
    if (enableErrorMonitoring) {
      const monitoring = initializeErrorMonitoring(errorMonitoringConfig)
      setErrorMonitoring(monitoring)
    }
  }, [enableErrorMonitoring, errorMonitoringConfig])

  // Enhanced error reporting functions that integrate with monitoring
  const reportError = (error: any, context?: Record<string, any>, userMessage?: string) => {
    const errorId = errorReporting.reportError(error, context, userMessage)
    
    // Also log to monitoring service
    if (errorMonitoring) {
      errorMonitoring.logError(error, context)
    }
    
    return errorId
  }

  const reportValidationError = (field: string, value: any, validationError: string, formContext?: Record<string, any>) => {
    const errorId = errorReporting.reportValidationError(field, value, validationError, formContext)
    
    if (errorMonitoring) {
      errorMonitoring.logError(
        new Error(`Validation failed for field '${field}': ${validationError}`),
        {
          context: 'validation_error',
          field,
          value,
          validationError,
          ...formContext
        }
      )
    }
    
    return errorId
  }

  const reportNetworkError = (error: any, endpoint: string, method: string = 'GET', requestData?: any) => {
    const errorId = errorReporting.reportNetworkError(error, endpoint, method, requestData)
    
    if (errorMonitoring) {
      errorMonitoring.logError(error, {
        context: 'network_error',
        endpoint,
        method,
        requestData
      })
    }
    
    return errorId
  }

  const reportFormError = (error: any, formName: string, formData?: Record<string, any>) => {
    const errorId = errorReporting.reportFormError(error, formName, formData)
    
    if (errorMonitoring) {
      errorMonitoring.logError(error, {
        context: 'form_submission_error',
        formName,
        formData
      })
    }
    
    return errorId
  }

  const reportFileUploadError = (error: any, fileName: string, fileSize: number, fileType: string) => {
    const errorId = errorReporting.reportFileUploadError(error, fileName, fileSize, fileType)
    
    if (errorMonitoring) {
      errorMonitoring.logError(error, {
        context: 'file_upload_error',
        fileName,
        fileSize,
        fileType
      })
    }
    
    return errorId
  }

  const reportCriticalError = (error: any, context?: Record<string, any>, userMessage?: string) => {
    const errorId = errorReporting.reportCriticalError(error, context, userMessage)
    
    if (errorMonitoring) {
      errorMonitoring.logError(error, { ...context, severity: 'critical' })
    }
    
    return errorId
  }

  const showErrorNotification = (error: any, props: any = {}) => {
    return errorNotifications.showError(error, props)
  }

  const contextValue: ErrorHandlingContextValue = {
    reportError,
    reportValidationError,
    reportNetworkError,
    reportFormError,
    reportFileUploadError,
    reportCriticalError,
    showErrorNotification,
    clearAllNotifications: errorNotifications.clearAll,
    errorStats: errorReporting.errorStats,
    hasErrors: errorReporting.hasErrors,
    hasRecentErrors: errorReporting.hasRecentErrors,
    hasCriticalErrors: errorReporting.hasCriticalErrors
  }

  return (
    <ErrorHandlingContext.Provider value={contextValue}>
      <ErrorBoundary
        onError={(error, errorInfo) => {
          reportCriticalError(
            error,
            { 
              context: 'react_error_boundary',
              componentStack: errorInfo.componentStack 
            },
            'A critical error occurred in the application. Please refresh the page.'
          )
        }}
      >
        {children}
        
        {/* Error Notifications */}
        {showErrorNotifications && (
          <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
            {errorNotifications.notifications.map(({ id, error, props }) => (
              <ErrorNotification
                key={id}
                error={error}
                {...props}
                onDismiss={() => errorNotifications.dismissError(id)}
              />
            ))}
          </div>
        )}
        
        {/* Toast notifications */}
        <Toaster />
      </ErrorBoundary>
    </ErrorHandlingContext.Provider>
  )
}

// Higher-order component for wrapping components with error handling
export function withErrorHandling<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: any
) {
  return function WrappedComponent(props: P) {
    const { reportError } = useErrorHandling()
    
    return (
      <ErrorBoundary
        {...errorBoundaryProps}
        onError={(error, errorInfo) => {
          reportError(
            error,
            { 
              context: 'component_error_boundary',
              componentName: Component.displayName || Component.name,
              componentStack: errorInfo.componentStack 
            }
          )
        }}
      >
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// Hook for component-level error handling
export function useComponentErrorHandler(componentName?: string) {
  const { reportError, showErrorNotification } = useErrorHandling()
  
  const handleError = (error: any, context?: Record<string, any>, showNotification = true) => {
    const errorId = reportError(error, {
      context: 'component_error',
      componentName,
      ...context
    })
    
    if (showNotification) {
      showErrorNotification(error, {
        title: `Error in ${componentName || 'Component'}`,
        retryable: false
      })
    }
    
    return errorId
  }
  
  const handleAsyncError = async (asyncFn: () => Promise<any>, context?: Record<string, any>) => {
    try {
      return await asyncFn()
    } catch (error) {
      handleError(error, context)
      throw error
    }
  }
  
  return {
    handleError,
    handleAsyncError
  }
}