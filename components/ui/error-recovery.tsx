'use client'

import React, { useState, useEffect } from 'react'
import { RefreshCw, AlertTriangle, CheckCircle, Clock, Wifi, WifiOff, Bug } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Progress } from './progress'
import { Badge } from './badge'
import { Alert, AlertDescription } from './alert'
import { cn } from '@/lib/utils'
import { isNetworkError, getErrorMessage } from '@/lib/utils/error-handling'

export interface ErrorRecoveryProps {
  error: any
  onRetry: () => Promise<void> | void
  onCancel?: () => void
  title?: string
  description?: string
  maxRetries?: number
  retryDelay?: number
  exponentialBackoff?: boolean
  showProgress?: boolean
  autoRetry?: boolean
  className?: string
}

export function ErrorRecovery({
  error,
  onRetry,
  onCancel,
  title,
  description,
  maxRetries = 3,
  retryDelay = 2000,
  exponentialBackoff = true,
  showProgress = true,
  autoRetry = false,
  className
}: ErrorRecoveryProps) {
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'retrying' | 'success' | 'failed'>('idle')

  const errorMessage = getErrorMessage(error)
  const isNetwork = isNetworkError(error)
  const canRetry = retryCount < maxRetries

  // Calculate delay with exponential backoff
  const getRetryDelay = (attempt: number) => {
    if (!exponentialBackoff) return retryDelay
    return Math.min(retryDelay * Math.pow(2, attempt), 30000) // Max 30 seconds
  }

  // Auto-retry logic
  useEffect(() => {
    if (autoRetry && canRetry && recoveryStatus === 'idle') {
      const delay = getRetryDelay(retryCount)
      setCountdown(delay / 1000)
      
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            handleRetry()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(countdownInterval)
    }
  }, [autoRetry, canRetry, recoveryStatus, retryCount])

  const handleRetry = async () => {
    if (!canRetry) return

    setIsRetrying(true)
    setRecoveryStatus('retrying')
    setRetryCount(prev => prev + 1)

    try {
      await onRetry()
      setRecoveryStatus('success')
      
      // Reset after success
      setTimeout(() => {
        setRetryCount(0)
        setRecoveryStatus('idle')
      }, 2000)
    } catch (retryError) {
      console.error('Retry failed:', retryError)
      
      if (retryCount >= maxRetries - 1) {
        setRecoveryStatus('failed')
      } else {
        setRecoveryStatus('idle')
      }
    } finally {
      setIsRetrying(false)
    }
  }

  const getStatusIcon = () => {
    switch (recoveryStatus) {
      case 'retrying':
        return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return isNetwork ? (
          error?.status ? <Wifi className="h-5 w-5 text-orange-500" /> : <WifiOff className="h-5 w-5 text-red-500" />
        ) : (
          <Bug className="h-5 w-5 text-orange-500" />
        )
    }
  }

  const getStatusMessage = () => {
    switch (recoveryStatus) {
      case 'retrying':
        return `Attempting to recover... (${retryCount}/${maxRetries})`
      case 'success':
        return 'Recovery successful!'
      case 'failed':
        return 'Recovery failed after maximum attempts'
      default:
        return errorMessage
    }
  }

  const getRecoveryAdvice = () => {
    if (isNetwork) {
      if (!error?.status) {
        return 'Check your internet connection and try again.'
      }
      if (error.status >= 500) {
        return 'The server is experiencing issues. Please try again in a few moments.'
      }
      if (error.status === 429) {
        return 'Too many requests. Please wait a moment before trying again.'
      }
      if (error.status >= 400) {
        return 'There was an issue with your request. Please check your input and try again.'
      }
    }
    return 'An unexpected error occurred. Retrying may resolve the issue.'
  }

  return (
    <Card className={cn('max-w-md mx-auto', className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <CardTitle className="text-lg">
              {title || (recoveryStatus === 'success' ? 'Recovered' : 'Error Occurred')}
            </CardTitle>
            <CardDescription>
              {description || getRecoveryAdvice()}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error Status */}
        <Alert variant={recoveryStatus === 'success' ? 'default' : 'destructive'}>
          <AlertDescription>
            {getStatusMessage()}
          </AlertDescription>
        </Alert>

        {/* Retry Progress */}
        {showProgress && retryCount > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Recovery Progress</span>
              <span>{retryCount}/{maxRetries}</span>
            </div>
            <Progress value={(retryCount / maxRetries) * 100} />
          </div>
        )}

        {/* Auto-retry countdown */}
        {autoRetry && countdown > 0 && recoveryStatus === 'idle' && canRetry && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Auto-retrying in {countdown}s...</span>
          </div>
        )}

        {/* Retry attempts info */}
        {retryCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Attempt {retryCount}/{maxRetries}
            </Badge>
            {exponentialBackoff && canRetry && (
              <Badge variant="secondary">
                Next delay: {Math.round(getRetryDelay(retryCount) / 1000)}s
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {canRetry && recoveryStatus !== 'retrying' && (
            <Button 
              onClick={handleRetry} 
              disabled={isRetrying}
              className="flex-1"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Now
                </>
              )}
            </Button>
          )}
          
          {!canRetry && recoveryStatus === 'failed' && (
            <Button onClick={() => window.location.reload()} className="flex-1">
              Refresh Page
            </Button>
          )}
          
          {onCancel && (
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          )}
        </div>

        {/* Additional Help */}
        {recoveryStatus === 'failed' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              If the problem persists, please contact support with the error details above.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

// Hook for managing error recovery
export function useErrorRecovery() {
  const [recoveryState, setRecoveryState] = useState<{
    error: any | null
    isRecovering: boolean
    retryCount: number
    maxRetries: number
  }>({
    error: null,
    isRecovering: false,
    retryCount: 0,
    maxRetries: 3
  })

  const startRecovery = (error: any, maxRetries = 3) => {
    setRecoveryState({
      error,
      isRecovering: true,
      retryCount: 0,
      maxRetries
    })
  }

  const attemptRecovery = async (recoveryFn: () => Promise<void> | void) => {
    if (recoveryState.retryCount >= recoveryState.maxRetries) {
      return false
    }

    try {
      setRecoveryState(prev => ({
        ...prev,
        retryCount: prev.retryCount + 1
      }))

      await recoveryFn()
      
      // Success - reset state
      setRecoveryState({
        error: null,
        isRecovering: false,
        retryCount: 0,
        maxRetries: 3
      })
      
      return true
    } catch (error) {
      console.error('Recovery attempt failed:', error)
      return false
    }
  }

  const cancelRecovery = () => {
    setRecoveryState({
      error: null,
      isRecovering: false,
      retryCount: 0,
      maxRetries: 3
    })
  }

  return {
    ...recoveryState,
    startRecovery,
    attemptRecovery,
    cancelRecovery,
    canRetry: recoveryState.retryCount < recoveryState.maxRetries
  }
}