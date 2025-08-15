'use client'

import React, { useEffect, useState } from 'react'
import { AlertTriangle, X, RefreshCw, Bug, Wifi, WifiOff, Clock } from 'lucide-react'
import { Button } from './button'
import { Badge } from './badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Progress } from './progress'
import { cn } from '@/lib/utils'
import { isNetworkError, getErrorMessage } from '@/lib/utils/error-handling'

export interface ErrorNotificationProps {
  error: any
  title?: string
  description?: string
  context?: string
  retryable?: boolean
  onRetry?: () => void
  onDismiss?: () => void
  autoRetry?: boolean
  maxAutoRetries?: number
  retryDelay?: number
  showDetails?: boolean
  className?: string
  variant?: 'toast' | 'banner' | 'modal'
}

export function ErrorNotification({
  error,
  title,
  description,
  context,
  retryable = false,
  onRetry,
  onDismiss,
  autoRetry = false,
  maxAutoRetries = 3,
  retryDelay = 5000,
  showDetails = false,
  className,
  variant = 'toast'
}: ErrorNotificationProps) {
  const [autoRetryCount, setAutoRetryCount] = useState(0)
  const [isAutoRetrying, setIsAutoRetrying] = useState(false)
  const [retryCountdown, setRetryCountdown] = useState(0)
  const [showDetailedError, setShowDetailedError] = useState(false)

  const errorMessage = getErrorMessage(error)
  const isNetwork = isNetworkError(error)
  
  // Auto-retry logic
  useEffect(() => {
    if (autoRetry && retryable && autoRetryCount < maxAutoRetries && onRetry) {
      setIsAutoRetrying(true)
      setRetryCountdown(retryDelay / 1000)
      
      const countdownInterval = setInterval(() => {
        setRetryCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            setAutoRetryCount(prev => prev + 1)
            setIsAutoRetrying(false)
            onRetry()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(countdownInterval)
    }
  }, [autoRetry, retryable, autoRetryCount, maxAutoRetries, onRetry, retryDelay])

  const getErrorIcon = () => {
    if (isNetwork) {
      return error?.status ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />
    }
    return <AlertTriangle className="h-4 w-4" />
  }

  const getErrorType = () => {
    if (isNetwork) {
      if (error?.status >= 500) return 'Server Error'
      if (error?.status >= 400) return 'Client Error'
      if (!error?.status) return 'Network Error'
    }
    return 'Application Error'
  }

  const getErrorSeverity = () => {
    if (isNetwork) {
      if (error?.status >= 500) return 'high'
      if (error?.status === 429) return 'medium'
      if (error?.status >= 400) return 'low'
    }
    return 'medium'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  if (variant === 'banner') {
    return (
      <div className={cn(
        'border-l-4 border-destructive bg-destructive/5 p-4',
        className
      )}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {getErrorIcon()}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-destructive">
                  {title || getErrorType()}
                </h4>
                <Badge variant={getSeverityColor(getErrorSeverity()) as any}>
                  {getErrorSeverity()}
                </Badge>
                {isNetwork && error?.status && (
                  <Badge variant="outline">HTTP {error.status}</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {description || errorMessage}
              </p>
              
              {isAutoRetrying && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Clock className="h-3 w-3" />
                  <span>Auto-retrying in {retryCountdown}s (attempt {autoRetryCount + 1}/{maxAutoRetries})</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                {retryable && onRetry && !isAutoRetrying && (
                  <Button onClick={onRetry} variant="outline" size="sm">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                )}
                {showDetails && (
                  <Button 
                    onClick={() => setShowDetailedError(!showDetailedError)}
                    variant="ghost" 
                    size="sm"
                  >
                    <Bug className="h-3 w-3 mr-1" />
                    {showDetailedError ? 'Hide' : 'Show'} Details
                  </Button>
                )}
              </div>

              {showDetailedError && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <div className="space-y-2 text-xs">
                    <div><strong>Error:</strong> {errorMessage}</div>
                    {error?.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    {context && (
                      <div><strong>Context:</strong> {context}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {onDismiss && (
            <Button onClick={onDismiss} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'modal') {
    return (
      <Card className={cn('max-w-md mx-auto border-destructive', className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getErrorIcon()}
              <CardTitle className="text-destructive">
                {title || getErrorType()}
              </CardTitle>
            </div>
            {onDismiss && (
              <Button onClick={onDismiss} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardDescription>
            {description || errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={getSeverityColor(getErrorSeverity()) as any}>
              {getErrorSeverity()}
            </Badge>
            {isNetwork && error?.status && (
              <Badge variant="outline">HTTP {error.status}</Badge>
            )}
          </div>

          {isAutoRetrying && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Auto-retrying...</span>
                <span>{autoRetryCount + 1}/{maxAutoRetries}</span>
              </div>
              <Progress value={(retryDelay - retryCountdown * 1000) / retryDelay * 100} />
            </div>
          )}

          <div className="flex items-center gap-2">
            {retryable && onRetry && !isAutoRetrying && (
              <Button onClick={onRetry} variant="outline" size="sm" className="flex-1">
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
            {showDetails && (
              <Button 
                onClick={() => setShowDetailedError(!showDetailedError)}
                variant="ghost" 
                size="sm"
              >
                <Bug className="h-3 w-3 mr-1" />
                Details
              </Button>
            )}
          </div>

          {showDetailedError && (
            <div className="p-3 bg-muted rounded-md">
              <div className="space-y-2 text-xs">
                <div><strong>Error:</strong> {errorMessage}</div>
                {error?.stack && (
                  <div>
                    <strong>Stack:</strong>
                    <pre className="mt-1 overflow-x-auto whitespace-pre-wrap max-h-32">
                      {error.stack}
                    </pre>
                  </div>
                )}
                {context && (
                  <div><strong>Context:</strong> {context}</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Default: toast variant
  return (
    <div className={cn(
      'flex items-start gap-3 p-4 bg-background border border-destructive rounded-lg shadow-lg',
      className
    )}>
      {getErrorIcon()}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-destructive">
            {title || getErrorType()}
          </p>
          <Badge variant={getSeverityColor(getErrorSeverity()) as any} className="text-xs">
            {getErrorSeverity()}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {description || errorMessage}
        </p>
        
        {isAutoRetrying && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Clock className="h-3 w-3" />
            <span>Retrying in {retryCountdown}s</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        {retryable && onRetry && !isAutoRetrying && (
          <Button onClick={onRetry} variant="ghost" size="sm">
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
        {onDismiss && (
          <Button onClick={onDismiss} variant="ghost" size="sm">
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}

// Hook for managing error notifications
export function useErrorNotification() {
  const [notifications, setNotifications] = useState<Array<{
    id: string
    error: any
    props: Partial<ErrorNotificationProps>
  }>>([])

  const showError = (error: any, props: Partial<ErrorNotificationProps> = {}) => {
    const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    setNotifications(prev => [...prev, {
      id,
      error,
      props: {
        ...props,
        onDismiss: () => dismissError(id),
      }
    }])

    return id
  }

  const dismissError = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return {
    notifications,
    showError,
    dismissError,
    clearAll,
    hasNotifications: notifications.length > 0
  }
}