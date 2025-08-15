import React from 'react'
import { withRetry, createNetworkError, logError, getContextualErrorMessage, ApiError } from './error-handling'

export interface NetworkRequestOptions extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
  retryCondition?: (error: any, attempt: number) => boolean
  onRetry?: (error: any, attempt: number) => void
  context?: string
}

export interface NetworkResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Headers
}

export class NetworkErrorHandler {
  private static defaultTimeout = 30000 // 30 seconds
  private static defaultRetries = 3
  private static defaultRetryDelay = 1000

  static async request<T = any>(
    url: string,
    options: NetworkRequestOptions = {}
  ): Promise<NetworkResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      retryCondition = this.defaultRetryCondition,
      onRetry,
      context = 'api_request',
      ...fetchOptions
    } = options

    return withRetry(
      async () => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        try {
          const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              ...fetchOptions.headers,
            },
          })

          clearTimeout(timeoutId)

          if (!response.ok) {
            let errorMessage = `Request failed: ${response.statusText}`
            let errorData: any = null

            try {
              errorData = await response.json()
              errorMessage = errorData.message || errorData.error || errorMessage
            } catch {
              // Response is not JSON, use default message
            }

            const error = new ApiError(errorMessage, response.status, response.statusText)
            logError(error, { 
              context, 
              url, 
              method: fetchOptions.method || 'GET',
              errorData 
            })
            throw error
          }

          let data: T
          try {
            data = await response.json()
          } catch {
            // Response is not JSON, return empty object
            data = {} as T
          }

          return {
            data,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          }
        } catch (error) {
          clearTimeout(timeoutId)

          if (error instanceof ApiError) {
            throw error
          }

          // Handle network errors, timeouts, etc.
          let networkError: Error

          if (error instanceof Error && error.name === 'AbortError') {
            networkError = createNetworkError('Request timeout', 408, error)
          } else if (error instanceof TypeError && error.message.includes('fetch')) {
            networkError = createNetworkError('Network connection failed', undefined, error)
          } else {
            networkError = createNetworkError('Request failed', undefined, error)
          }

          logError(networkError, { 
            context, 
            url, 
            method: fetchOptions.method || 'GET' 
          })
          throw networkError
        }
      },
      {
        maxRetries: retries,
        baseDelay: retryDelay,
        retryCondition: (error, attempt) => {
          const shouldRetry = retryCondition(error, attempt)
          if (shouldRetry && onRetry) {
            onRetry(error, attempt)
          }
          return shouldRetry
        },
      }
    )
  }

  private static defaultRetryCondition(error: any, attempt: number): boolean {
    // Don't retry client errors (4xx) except for specific cases
    if (error?.status >= 400 && error?.status < 500) {
      // Retry on rate limiting and request timeout
      return error.status === 429 || error.status === 408
    }

    // Retry on server errors (5xx) and network errors
    if (error?.status >= 500 || !error?.status) {
      return attempt < 3
    }

    return false
  }

  // Convenience methods
  static async get<T = any>(url: string, options: Omit<NetworkRequestOptions, 'method'> = {}): Promise<NetworkResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' })
  }

  static async post<T = any>(url: string, data?: any, options: Omit<NetworkRequestOptions, 'method' | 'body'> = {}): Promise<NetworkResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  static async put<T = any>(url: string, data?: any, options: Omit<NetworkRequestOptions, 'method' | 'body'> = {}): Promise<NetworkResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  static async patch<T = any>(url: string, data?: any, options: Omit<NetworkRequestOptions, 'method' | 'body'> = {}): Promise<NetworkResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  static async delete<T = any>(url: string, options: Omit<NetworkRequestOptions, 'method'> = {}): Promise<NetworkResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' })
  }

  // File upload with progress
  static async uploadFile<T = any>(
    url: string,
    file: File,
    options: Omit<NetworkRequestOptions, 'method' | 'body'> & {
      onProgress?: (progress: number) => void
      additionalData?: Record<string, any>
    } = {}
  ): Promise<NetworkResponse<T>> {
    const { onProgress, additionalData, ...requestOptions } = options

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const formData = new FormData()
      
      formData.append('file', file)
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, String(value))
        })
      }

      // Handle progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100
            onProgress(progress)
          }
        })
      }

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText)
            resolve({
              data,
              status: xhr.status,
              statusText: xhr.statusText,
              headers: new Headers(), // XMLHttpRequest doesn't provide easy access to response headers
            })
          } catch {
            resolve({
              data: {} as T,
              status: xhr.status,
              statusText: xhr.statusText,
              headers: new Headers(),
            })
          }
        } else {
          const error = new ApiError(
            `Upload failed: ${xhr.statusText}`,
            xhr.status,
            xhr.statusText
          )
          logError(error, { context: 'file_upload', url, fileName: file.name })
          reject(error)
        }
      })

      // Handle errors
      xhr.addEventListener('error', () => {
        const error = createNetworkError('Upload failed', undefined, new Error('Network error'))
        logError(error, { context: 'file_upload', url, fileName: file.name })
        reject(error)
      })

      // Handle timeout
      xhr.addEventListener('timeout', () => {
        const error = createNetworkError('Upload timeout', 408)
        logError(error, { context: 'file_upload', url, fileName: file.name })
        reject(error)
      })

      // Set timeout
      xhr.timeout = requestOptions.timeout || this.defaultTimeout

      // Start upload
      xhr.open('POST', url)
      
      // Set headers (excluding Content-Type for FormData)
      if (requestOptions.headers) {
        Object.entries(requestOptions.headers).forEach(([key, value]) => {
          if (key.toLowerCase() !== 'content-type') {
            xhr.setRequestHeader(key, String(value))
          }
        })
      }

      xhr.send(formData)
    })
  }
}

// Hook for using network error handler in React components
export function useNetworkErrorHandler() {
  const [retryAttempts, setRetryAttempts] = React.useState<Record<string, number>>({})
  const [isRetrying, setIsRetrying] = React.useState<Record<string, boolean>>({})

  const handleError = (error: any, context?: string) => {
    const message = getContextualErrorMessage(error, context || 'network_request')
    
    // You could integrate with a toast notification system here
    console.error('Network error:', message, error)
    
    return message
  }

  const isRetryableError = (error: any): boolean => {
    return NetworkErrorHandler['defaultRetryCondition'](error, 0)
  }

  const retryRequest = async <T>(
    requestFn: () => Promise<T>,
    requestId: string,
    maxRetries = 3,
    onRetry?: (attempt: number, error: any) => void
  ): Promise<T> => {
    setIsRetrying(prev => ({ ...prev, [requestId]: true }))
    
    try {
      const result = await withRetry(requestFn, { 
        maxRetries,
        onRetry: (error, attempt) => {
          setRetryAttempts(prev => ({ ...prev, [requestId]: attempt }))
          onRetry?.(attempt, error)
        }
      })
      
      // Reset retry state on success
      setRetryAttempts(prev => ({ ...prev, [requestId]: 0 }))
      setIsRetrying(prev => ({ ...prev, [requestId]: false }))
      
      return result
    } catch (error) {
      setIsRetrying(prev => ({ ...prev, [requestId]: false }))
      throw error
    }
  }

  const getRetryState = (requestId: string) => ({
    attempts: retryAttempts[requestId] || 0,
    isRetrying: isRetrying[requestId] || false
  })

  return {
    handleError,
    isRetryableError,
    retryRequest,
    getRetryState,
    request: NetworkErrorHandler.request.bind(NetworkErrorHandler),
    get: NetworkErrorHandler.get.bind(NetworkErrorHandler),
    post: NetworkErrorHandler.post.bind(NetworkErrorHandler),
    put: NetworkErrorHandler.put.bind(NetworkErrorHandler),
    patch: NetworkErrorHandler.patch.bind(NetworkErrorHandler),
    delete: NetworkErrorHandler.delete.bind(NetworkErrorHandler),
    uploadFile: NetworkErrorHandler.uploadFile.bind(NetworkErrorHandler),
  }
}

