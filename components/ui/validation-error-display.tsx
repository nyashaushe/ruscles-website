'use client'

import React from 'react'
import { AlertCircle, X, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription } from './alert'
import { Button } from './button'
import { Badge } from './badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'
import { cn } from '@/lib/utils'

export interface ValidationErrorItem {
  field: string
  message: string
  code?: string
  value?: any
}

export interface ValidationErrorDisplayProps {
  errors: ValidationErrorItem[]
  title?: string
  showFieldNames?: boolean
  showErrorCodes?: boolean
  showValues?: boolean
  collapsible?: boolean
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
  variant?: 'inline' | 'card' | 'alert'
}

export function ValidationErrorDisplay({
  errors,
  title = 'Validation Errors',
  showFieldNames = true,
  showErrorCodes = false,
  showValues = false,
  collapsible = false,
  onRetry,
  onDismiss,
  className,
  variant = 'alert'
}: ValidationErrorDisplayProps) {
  if (!errors || errors.length === 0) return null

  const errorCount = errors.length
  const uniqueFields = new Set(errors.map(e => e.field)).size

  const ErrorContent = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="font-medium">
            {errorCount} validation error{errorCount > 1 ? 's' : ''} found
            {uniqueFields !== errorCount && ` across ${uniqueFields} field${uniqueFields > 1 ? 's' : ''}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onRetry && (
            <Button onClick={onRetry} variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button onClick={onDismiss} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {errors.map((error, index) => (
          <div
            key={`${error.field}-${index}`}
            className="flex items-start gap-3 p-3 bg-destructive/5 border border-destructive/20 rounded-md"
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                {showFieldNames && (
                  <Badge variant="outline" className="text-xs">
                    {error.field}
                  </Badge>
                )}
                {showErrorCodes && error.code && (
                  <Badge variant="secondary" className="text-xs">
                    {error.code}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-destructive font-medium">
                {error.message}
              </p>
              {showValues && error.value !== undefined && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Value:</span>{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">
                    {typeof error.value === 'object' 
                      ? JSON.stringify(error.value) 
                      : String(error.value)
                    }
                  </code>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (variant === 'card') {
    const CardComponent = collapsible ? Collapsible : 'div'
    const CardTrigger = collapsible ? CollapsibleTrigger : 'div'
    const CardContentWrapper = collapsible ? CollapsibleContent : 'div'

    return (
      <CardComponent className={cn('w-full', className)}>
        <Card className="border-destructive">
          <CardHeader className="pb-3">
            <CardTrigger className={collapsible ? 'cursor-pointer hover:bg-muted/50 -m-3 p-3 rounded-md' : ''}>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {title}
                  </CardTitle>
                  <CardDescription>
                    Please fix the following validation errors to continue
                  </CardDescription>
                </div>
                {collapsible && (
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                )}
              </div>
            </CardTrigger>
          </CardHeader>
          <CardContentWrapper>
            <CardContent>
              <ErrorContent />
            </CardContent>
          </CardContentWrapper>
        </Card>
      </CardComponent>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={cn('space-y-2', className)}>
        {errors.map((error, index) => (
          <div
            key={`${error.field}-${index}`}
            className="flex items-center gap-2 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {showFieldNames && (
              <Badge variant="outline" className="text-xs">
                {error.field}
              </Badge>
            )}
            <span>{error.message}</span>
          </div>
        ))}
      </div>
    )
  }

  // Default: alert variant
  return (
    <Alert variant="destructive" className={cn('', className)}>
      <ErrorContent />
    </Alert>
  )
}

// Specialized component for form validation errors
export function FormValidationErrors({
  errors,
  onFieldFocus,
  ...props
}: ValidationErrorDisplayProps & {
  onFieldFocus?: (fieldName: string) => void
}) {
  const handleFieldClick = (fieldName: string) => {
    onFieldFocus?.(fieldName)
    
    // Try to focus the field element
    const fieldElement = document.querySelector(`[name="${fieldName}"], #${fieldName}`)
    if (fieldElement instanceof HTMLElement) {
      fieldElement.focus()
      fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const enhancedErrors = errors.map(error => ({
    ...error,
    onClick: () => handleFieldClick(error.field)
  }))

  return (
    <ValidationErrorDisplay
      {...props}
      errors={errors}
      title="Form Validation Errors"
      showFieldNames={true}
      variant="card"
    />
  )
}

// Component for real-time field validation feedback
export function FieldValidationFeedback({
  error,
  touched,
  showSuccess = false,
  className
}: {
  error?: string
  touched?: boolean
  showSuccess?: boolean
  className?: string
}) {
  if (!touched) return null

  if (error) {
    return (
      <div className={cn('flex items-center gap-1 text-sm text-destructive mt-1', className)}>
        <AlertCircle className="h-3 w-3" />
        <span>{error}</span>
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className={cn('flex items-center gap-1 text-sm text-green-600 mt-1', className)}>
        <div className="h-3 w-3 rounded-full bg-green-600" />
        <span>Valid</span>
      </div>
    )
  }

  return null
}