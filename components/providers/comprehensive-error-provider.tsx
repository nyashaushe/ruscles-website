'use client'

import React, { createContext, useContext, useEffect } from 'react'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { ErrorHandlingProvider } from './error-handling-provider'
import { useErrorReporting, useGlobalErrorHandler } from '@/hooks/use-error-reporting'
import { useErrorNotification } from '@/components/ui/error-notification'
import { Toaster } from '@/components/ui/toaster'

interface ComprehensiveErrorContextValue {
  reportError: (error: any, context?: Record<string, any>, userMessage?: string) => string
  reportValidationError: (field: string, value: any, validationError: string, formContext?: Record<string, any>) => string
  reportNetworkError: (error: any, endpoint: string, method?: string, requestData?: any) => string
  reportFormError: (error: any, formName: string, formData?: Record<string, any>) => string
  reportFileUploadError: (error: any, fileName: string, fileSize: number, fileType: string) => string
  reportCriticalError: (error: any, context?: Record<string, any>, userMessage?: string) => string
  showErrorNotification: (error: any, props?: any) => string
  clearAllErrors: () => void
  exportErrorLogs: () => void
  errorStats: any
  hasErrors: boolean
  hasRecentErrors: boolean
  hasCriticalErrors: boolean
}

const ComprehensiveErrorContext = createContext<ComprehensiveErrorContextValue | null>(null)

export function useComprehensiveErrorHandling() {
  const context = useContext(ComprehensiveErrorContext)
  if (!context) {
    throw new Error('useComprehensiveErrorHandling must be used within ComprehensiveErrorProvider')
  }
  return context
}

interface ComprehensiveErrorProviderProps {
  children: React.ReactNode
  enableGlobalErrorHandling?: boolean
  enableErrorNotifications?: boolean
  enableErrorReporting?: boolean
}

export function ComprehensiveErrorProvider({
  children,
  enableGlobalErrorHandling = true,
  enableErrorNotifications = true,
  enableErrorReporting = true
}: ComprehensiveErrorProviderProps) {
  // Initialize error reporting
  const errorReporting = useErrorReporting({
    showToastOnError: enableErrorNotifications,
    autoReportCriticalErrors: enableErrorReporting,
    enableConsoleLogging: process.env.NODE_ENV === 'development'
  })

  // Initialize error notifications
  const { showError: showErrorNotification } = useErrorNotification()

  // Initialize global error handler
  if (enableGlobalErrorHandling) {
    useGlobalErrorHandler()
  }

  // Monitor error patterns
  useEffect(() => {
    if (enableErrorReporting) {
      const interval = setInterval(() => {
        errorReporting.checkErrorPatterns()
      }, 5 * 60 * 1000) // Check every 5 minutes

      return () => clearInterval(interval)
    }
  }, [enableErrorReporting, errorReporting])

  const contextValue: ComprehensiveErrorContextValue = {
    reportError: errorReporting.reportError,
    reportValidationError: errorReporting.reportValidationError,
    reportNetworkError: errorReporting.reportNetworkError,
    reportFormError: errorReporting.reportFormError,
    reportFileUploadError: errorReporting.reportFileUploadError,
    reportCriticalError: errorReporting.reportCriticalError,
    showErrorNotification,
    clearAllErrors: errorReporting.clearAllErrors,
    exportErrorLogs: errorReporting.exportErrorLogs,
    errorStats: errorReporting.errorStats,
    hasErrors: errorReporting.hasErrors,
    hasRecentErrors: errorReporting.hasRecentErrors,
    hasCriticalErrors: errorReporting.hasCriticalErrors
  }

  return (
    <ComprehensiveErrorContext.Provider value={contextValue}>
      <ErrorHandlingProvider>
        <ErrorBoundary
          onError={(error, errorInfo) => {
            errorReporting.reportCriticalError(
              error,
              { 
                context: 'app_error_boundary',
                componentStack: errorInfo.componentStack 
              },
              'A critical application error occurred. Please refresh the page.'
            )
          }}
        >
          {children}
          {enableErrorNotifications && <Toaster />}
        </ErrorBoundary>
      </ErrorHandlingProvider>
    </ComprehensiveErrorContext.Provider>
  )
}

// Higher-order component for wrapping components with error handling
export function withErrorHandling<P extends object>(
  Component: React.ComponentType<P>,
  errorHandlingOptions?: {
    fallback?: React.ComponentType<{ error: Error; retry: () => void }>
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
    context?: string
  }
) {
  const WrappedComponent = (props: P) => {
    const { reportError } = useComprehensiveErrorHandling()

    const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
      reportError(error, {
        context: errorHandlingOptions?.context || 'component_error',
        componentStack: errorInfo.componentStack
      })
      
      errorHandlingOptions?.onError?.(error, errorInfo)
    }

    return (
      <ErrorBoundary
        onError={handleError}
        fallback={errorHandlingOptions?.fallback ? 
          <errorHandlingOptions.fallback error={new Error('Component error')} retry={() => window.location.reload()} /> : 
          undefined
        }
      >
        <Component {...props} />
      </ErrorBoundary>
    )
  }

  WrappedComponent.displayName = `withErrorHandling(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Hook for component-level error handling
export function useComponentErrorHandling(componentName?: string) {
  const { reportError, reportCriticalError } = useComprehensiveErrorHandling()

  const handleError = (error: any, context?: Record<string, any>) => {
    return reportError(error, {
      context: 'component_error',
      componentName,
      ...context
    })
  }

  const handleCriticalError = (error: any, context?: Record<string, any>) => {
    return reportCriticalError(error, {
      context: 'component_critical_error',
      componentName,
      ...context
    })
  }

  const wrapAsyncFunction = <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    errorContext?: Record<string, any>
  ) => {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args)
      } catch (error) {
        handleError(error, {
          functionName: fn.name,
          arguments: args,
          ...errorContext
        })
        throw error
      }
    }
  }

  const wrapFunction = <T extends any[], R>(
    fn: (...args: T) => R,
    errorContext?: Record<string, any>
  ) => {
    return (...args: T): R => {
      try {
        return fn(...args)
      } catch (error) {
        handleError(error, {
          functionName: fn.name,
          arguments: args,
          ...errorContext
        })
        throw error
      }
    }
  }

  return {
    handleError,
    handleCriticalError,
    wrapAsyncFunction,
    wrapFunction
  }
}