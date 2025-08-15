// API client utility for form and content management
import { NetworkErrorHandler } from '../utils/network-error-handler'
import { logError, getContextualErrorMessage } from '../utils/error-handling'

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  success: boolean
}

class ApiClient {
  private baseUrl: string
  private networkHandler: typeof NetworkErrorHandler

  constructor(baseUrl: string = '/api/admin') {
    this.baseUrl = baseUrl
    this.networkHandler = NetworkErrorHandler
  }

  // Generic CRUD operations with enhanced error handling
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const searchParams = params ? new URLSearchParams(params).toString() : ''
    const url = searchParams ? `${this.baseUrl}${endpoint}?${searchParams}` : `${this.baseUrl}${endpoint}`
    
    try {
      const response = await this.networkHandler.get<T>(url, {
        context: 'api_get',
        retries: 3,
        onRetry: (error, attempt) => {
          console.log(`Retrying GET ${endpoint} (attempt ${attempt + 1}):`, error.message)
        }
      })
      return response.data
    } catch (error) {
      const contextualMessage = getContextualErrorMessage(error, 'api_request')
      logError(error, { 
        context: 'api_get', 
        endpoint, 
        params,
        userMessage: contextualMessage 
      })
      throw error
    }
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await this.networkHandler.post<T>(url, data, {
        context: 'api_post',
        retries: 2, // Fewer retries for POST to avoid duplicate submissions
        onRetry: (error, attempt) => {
          console.log(`Retrying POST ${endpoint} (attempt ${attempt + 1}):`, error.message)
        }
      })
      return response.data
    } catch (error) {
      const contextualMessage = getContextualErrorMessage(error, 'form_submission')
      logError(error, { 
        context: 'api_post', 
        endpoint, 
        data,
        userMessage: contextualMessage 
      })
      throw error
    }
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await this.networkHandler.put<T>(url, data, {
        context: 'api_put',
        retries: 2,
        onRetry: (error, attempt) => {
          console.log(`Retrying PUT ${endpoint} (attempt ${attempt + 1}):`, error.message)
        }
      })
      return response.data
    } catch (error) {
      const contextualMessage = getContextualErrorMessage(error, 'content_save')
      logError(error, { 
        context: 'api_put', 
        endpoint, 
        data,
        userMessage: contextualMessage 
      })
      throw error
    }
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await this.networkHandler.patch<T>(url, data, {
        context: 'api_patch',
        retries: 2,
        onRetry: (error, attempt) => {
          console.log(`Retrying PATCH ${endpoint} (attempt ${attempt + 1}):`, error.message)
        }
      })
      return response.data
    } catch (error) {
      const contextualMessage = getContextualErrorMessage(error, 'content_save')
      logError(error, { 
        context: 'api_patch', 
        endpoint, 
        data,
        userMessage: contextualMessage 
      })
      throw error
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await this.networkHandler.delete<T>(url, {
        context: 'api_delete',
        retries: 2,
        onRetry: (error, attempt) => {
          console.log(`Retrying DELETE ${endpoint} (attempt ${attempt + 1}):`, error.message)
        }
      })
      return response.data
    } catch (error) {
      const contextualMessage = getContextualErrorMessage(error, 'api_request')
      logError(error, { 
        context: 'api_delete', 
        endpoint,
        userMessage: contextualMessage 
      })
      throw error
    }
  }

  // Enhanced file upload with progress tracking and better error handling
  async uploadFile(
    endpoint: string, 
    file: File, 
    options: {
      additionalData?: Record<string, any>
      onProgress?: (progress: number) => void
      timeout?: number
    } = {}
  ): Promise<any> {
    const { additionalData, onProgress, timeout = 60000 } = options
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await this.networkHandler.uploadFile(url, file, {
        additionalData,
        onProgress,
        timeout,
        context: 'file_upload',
        onRetry: (error, attempt) => {
          console.log(`Retrying file upload ${endpoint} (attempt ${attempt + 1}):`, error.message)
        }
      })
      return response.data
    } catch (error) {
      const contextualMessage = getContextualErrorMessage(error, 'file_upload')
      logError(error, { 
        context: 'file_upload', 
        endpoint, 
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        userMessage: contextualMessage 
      })
      throw error
    }
  }

  // Batch operations with individual error handling
  async batchRequest<T>(requests: Array<{
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    endpoint: string
    data?: any
  }>): Promise<Array<{ success: boolean; data?: T; error?: any }>> {
    const results = await Promise.allSettled(
      requests.map(async (request) => {
        try {
          let result: T
          switch (request.method) {
            case 'GET':
              result = await this.get<T>(request.endpoint)
              break
            case 'POST':
              result = await this.post<T>(request.endpoint, request.data)
              break
            case 'PUT':
              result = await this.put<T>(request.endpoint, request.data)
              break
            case 'PATCH':
              result = await this.patch<T>(request.endpoint, request.data)
              break
            case 'DELETE':
              result = await this.delete<T>(request.endpoint)
              break
            default:
              throw new Error(`Unsupported method: ${request.method}`)
          }
          return { success: true, data: result }
        } catch (error) {
          return { success: false, error }
        }
      })
    )

    return results.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return { success: false, error: result.reason }
      }
    })
  }

  // Health check endpoint
  async healthCheck(): Promise<{ status: 'ok' | 'error'; timestamp: string }> {
    try {
      const response = await this.networkHandler.get<{ status: 'ok'; timestamp: string }>(`${this.baseUrl}/health`, {
        timeout: 5000,
        retries: 1,
        context: 'health_check'
      })
      return response.data
    } catch (error) {
      logError(error, { context: 'health_check' })
      return { status: 'error', timestamp: new Date().toISOString() }
    }
  }
}

export const apiClient = new ApiClient()

// Export error handling utilities for use in components
export { getContextualErrorMessage, logError } from '../utils/error-handling'
export { useNetworkErrorHandler } from '../utils/network-error-handler'