export interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  retryCondition?: (error: any) => boolean
}

export interface NetworkError extends Error {
  status?: number
  code?: string
  isNetworkError: boolean
  isRetryable: boolean
}

export class ApiError extends Error implements NetworkError {
  public status?: number
  public code?: string
  public isNetworkError = true
  public isRetryable = false

  constructor(message: string, status?: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.isRetryable = this.determineRetryability(status)
  }

  private determineRetryability(status?: number): boolean {
    if (!status) return true // Network errors are retryable
    
    // Retry on server errors and rate limiting
    return status >= 500 || status === 429 || status === 408
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryCondition = (error: any) => error?.isRetryable !== false
  } = options

  let lastError: any
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry on last attempt or if error is not retryable
      if (attempt === maxRetries || !retryCondition(error)) {
        throw error
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt),
        maxDelay
      )

      // Add jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000

      await new Promise(resolve => setTimeout(resolve, jitteredDelay))
    }
  }

  throw lastError
}

export function createNetworkError(
  message: string,
  status?: number,
  originalError?: any
): NetworkError {
  const error = new ApiError(message, status)
  
  if (originalError) {
    error.stack = originalError.stack
    error.cause = originalError
  }

  return error
}

export function isNetworkError(error: any): error is NetworkError {
  return error?.isNetworkError === true
}

export function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error
  
  if (error?.message) return error.message
  
  if (isNetworkError(error)) {
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.'
      case 401:
        return 'You are not authorized to perform this action. Please log in again.'
      case 403:
        return 'You do not have permission to perform this action.'
      case 404:
        return 'The requested resource was not found.'
      case 429:
        return 'Too many requests. Please wait a moment and try again.'
      case 500:
        return 'Server error. Please try again later.'
      case 503:
        return 'Service temporarily unavailable. Please try again later.'
      default:
        return 'A network error occurred. Please check your connection and try again.'
    }
  }

  return 'An unexpected error occurred. Please try again.'
}

export interface ErrorLogEntry {
  id: string
  message: string
  stack?: string
  status?: number
  code?: string
  timestamp: string
  url?: string
  userAgent?: string
  userId?: string
  sessionId?: string
  context?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'network' | 'validation' | 'runtime' | 'user' | 'system'
}

export function logError(error: any, context?: Record<string, any>) {
  const errorData: ErrorLogEntry = {
    id: generateErrorId(),
    message: getErrorMessage(error),
    stack: error?.stack,
    status: error?.status,
    code: error?.code,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    userId: context?.userId,
    sessionId: getSessionId(),
    context,
    severity: determineSeverity(error),
    category: determineCategory(error)
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorData)
  }

  // Store in localStorage for debugging
  try {
    const existingErrors = JSON.parse(localStorage.getItem('error_logs') || '[]')
    existingErrors.push(errorData)
    localStorage.setItem('error_logs', JSON.stringify(existingErrors.slice(-100)))
  } catch (e) {
    console.error('Failed to store error log:', e)
  }

  // Send to monitoring service
  sendToMonitoringService(errorData)

  return errorData.id
}

function generateErrorId(): string {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  
  let sessionId = sessionStorage.getItem('session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('session_id', sessionId)
  }
  return sessionId
}

function determineSeverity(error: any): ErrorLogEntry['severity'] {
  if (isNetworkError(error)) {
    if (error.status >= 500) return 'high'
    if (error.status === 429) return 'medium'
    if (error.status >= 400) return 'low'
  }
  
  if (error?.name === 'ChunkLoadError' || error?.name === 'TypeError') return 'high'
  if (error?.message?.includes('Network')) return 'medium'
  
  return 'medium'
}

function determineCategory(error: any): ErrorLogEntry['category'] {
  if (isNetworkError(error)) return 'network'
  if (error?.name === 'ValidationError' || error?.code?.includes('validation')) return 'validation'
  if (error?.name === 'TypeError' || error?.name === 'ReferenceError') return 'runtime'
  if (error?.message?.includes('user') || error?.message?.includes('permission')) return 'user'
  
  return 'system'
}

async function sendToMonitoringService(errorData: ErrorLogEntry) {
  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    try {
      // Example: Send to custom monitoring endpoint
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      })
    } catch (e) {
      console.error('Failed to send error to monitoring service:', e)
    }
  }
}

// Error reporting utilities
export function getErrorLogs(): ErrorLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem('error_logs') || '[]')
  } catch {
    return []
  }
}

export function clearErrorLogs(): void {
  localStorage.removeItem('error_logs')
}

export function getErrorStats(): {
  total: number
  byCategory: Record<string, number>
  bySeverity: Record<string, number>
  recent: number
} {
  const logs = getErrorLogs()
  const now = Date.now()
  const oneHourAgo = now - (60 * 60 * 1000)
  
  const stats = {
    total: logs.length,
    byCategory: {} as Record<string, number>,
    bySeverity: {} as Record<string, number>,
    recent: logs.filter(log => new Date(log.timestamp).getTime() > oneHourAgo).length
  }
  
  logs.forEach(log => {
    stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1
    stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1
  })
  
  return stats
}

// User-friendly error messages for specific contexts
export function getContextualErrorMessage(error: any, context: string): string {
  const baseMessage = getErrorMessage(error)
  
  switch (context) {
    case 'form_submission':
      if (isNetworkError(error)) {
        return 'Unable to submit form. Please check your connection and try again.'
      }
      return 'There was an error submitting your form. Please try again.'
      
    case 'file_upload':
      if (error?.message?.includes('size')) {
        return 'File is too large. Please choose a smaller file.'
      }
      if (error?.message?.includes('type')) {
        return 'File type not supported. Please choose a different file.'
      }
      return 'Unable to upload file. Please try again.'
      
    case 'content_save':
      if (isNetworkError(error) && error.status === 409) {
        return 'This content has been modified by another user. Please refresh and try again.'
      }
      return 'Unable to save content. Your changes have been preserved locally.'
      
    case 'authentication':
      if (error?.status === 401) {
        return 'Your session has expired. Please log in again.'
      }
      if (error?.status === 403) {
        return 'You do not have permission to perform this action.'
      }
      return 'Authentication error. Please log in again.'
      
    default:
      return baseMessage
  }
}