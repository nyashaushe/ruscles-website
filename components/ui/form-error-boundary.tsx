'use client'

import React, { useState, useCallback } from 'react'
import { ErrorBoundary } from './error-boundary'
import { AlertCircle, RefreshCw, Bug, ChevronDown, ChevronUp } from 'lucide-react'
import { Alert, AlertDescription } from './alert'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { logError, getContextualErrorMessage } from '@/lib/utils/error-handling'

interface FormErrorBoundaryProps {
  children: React.ReactNode
  formName?: string
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  showRetry?: boolean
  showDetails?: boolean
}

export function FormErrorBoundary({ 
  children, 
  formName,
  onError,
  showRetry = true,
  showDetails = false
}: FormErrorBoundaryProps) {
  const [retryCount, setRetryCount] = useState(0)
  const [showErrorDetails, setShowErrorDetails] = useState(false)

  const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    // Log form-specific error context
    const errorId = logError(error, {
      context: 'form_error_boundary',
      formName,
      retryCount,
      componentStack: errorInfo.componentStack
    })

    console.error(`Form error in ${formName || 'unknown form'}:`, error, errorInfo)
    
    // Call custom error handler if provided
    onError?.(error, errorInfo)

    // Store error details for debugging
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`form_error_${formName || 'unknown'}`, JSON.stringify({
        errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        retryCount
      }))
    }
  }, [formName, onError, retryCount])

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1)
    // The ErrorBoundary component will handle the actual retry
  }, [])

  const fallback = useCallback((error?: Error, errorInfo?: React.ErrorInfo) => {
    const contextualMessage = getContextualErrorMessage(error, 'form_submission')
    
    return (
      <Card className="max-w-2xl mx-auto my-4 border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Form Error</CardTitle>
          </div>
          <CardDescription>
            {contextualMessage}
            {formName && ` (Form: ${formName})`}
            {retryCount > 0 && ` (Attempt ${retryCount + 1})`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error details (collapsible) */}
          {showDetails && error && (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                className="p-0 h-auto font-normal text-muted-foreground"
              >
                <Bug className="h-4 w-4 mr-2" />
                Error Details
                {showErrorDetails ? (
                  <ChevronUp className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2" />
                )}
              </Button>
              
              {showErrorDetails && (
                <div className="p-3 bg-muted rounded-md border">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Error:</span> {error.message}
                    </div>
                    {error.stack && (
                      <div>
                        <span className="font-medium">Stack:</span>
                        <pre className="mt-1 text-xs overflow-x-auto whitespace-pre-wrap">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    {errorInfo?.componentStack && (
                      <div>
                        <span className="font-medium">Component Stack:</span>
                        <pre className="mt-1 text-xs overflow-x-auto whitespace-pre-wrap">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            {showRetry && (
              <Button onClick={handleRetry} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button 
              onClick={() => window.location.reload()} 
              variant="default" 
              size="sm"
            >
              Refresh Page
            </Button>
            {formName && (
              <Button
                onClick={() => {
                  // Clear form data and retry
                  if (typeof window !== 'undefined') {
                    sessionStorage.removeItem(`form_data_${formName}`)
                    sessionStorage.removeItem(`form_error_${formName}`)
                  }
                  handleRetry()
                }}
                variant="outline"
                size="sm"
              >
                Reset Form
              </Button>
            )}
          </div>

          {/* Help text */}
          <div className="text-sm text-muted-foreground">
            If this problem persists, please contact support with the error details above.
          </div>
        </CardContent>
      </Card>
    )
  }, [formName, retryCount, showDetails, showRetry, handleRetry])

  return (
    <ErrorBoundary 
      fallback={fallback()}
      onError={handleError}
      key={retryCount} // Force remount on retry
    >
      {children}
    </ErrorBoundary>
  )
}

// Simplified version for inline form errors
export function InlineFormError({ 
  error, 
  onRetry, 
  showRetry = true 
}: { 
  error: string | Error
  onRetry?: () => void
  showRetry?: boolean 
}) {
  const errorMessage = typeof error === 'string' ? error : error.message

  return (
    <Alert variant="destructive" className="my-2">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{errorMessage}</span>
        {showRetry && onRetry && (
          <Button onClick={onRetry} variant="ghost" size="sm" className="ml-2">
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}