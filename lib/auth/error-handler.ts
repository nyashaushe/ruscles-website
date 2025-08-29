/**
 * Authentication Error Handler
 * Provides centralized error handling for authentication flows
 */

export interface AuthError {
    type: 'network' | 'validation' | 'authorization' | 'configuration' | 'unknown'
    code: string
    message: string
    userMessage: string
    canRetry: boolean
    details?: any
}

export interface NetworkErrorDetails {
    isOnline: boolean
    status?: number
    statusText?: string
    timeout?: boolean
}

export class AuthErrorHandler {
    /**
     * Categorizes and formats authentication errors for user display
     */
    static handleAuthError(error: any, context: string = 'authentication'): AuthError {
        // Network errors
        if (this.isNetworkError(error)) {
            return this.createNetworkError(error)
        }

        // NextAuth specific errors
        if (typeof error === 'string') {
            return this.handleNextAuthError(error)
        }

        // JavaScript/API errors
        if (error instanceof Error) {
            return this.handleJavaScriptError(error, context)
        }

        // Unknown error format
        return this.createUnknownError(error)
    }

    /**
     * Handles NextAuth error strings
     */
    private static handleNextAuthError(errorString: string): AuthError {
        switch (errorString) {
            case 'CredentialsSignin':
                return {
                    type: 'validation',
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password provided',
                    userMessage: 'Invalid email or password. Please check your credentials and try again.',
                    canRetry: true
                }

            case 'AccessDenied':
                return {
                    type: 'authorization',
                    code: 'ACCESS_DENIED',
                    message: 'User email not in allowed admin list',
                    userMessage: 'Access denied. Your email is not authorized to access this portal. Please contact your administrator.',
                    canRetry: false
                }

            case 'Configuration':
                return {
                    type: 'configuration',
                    code: 'CONFIG_ERROR',
                    message: 'Authentication configuration error',
                    userMessage: 'There is a configuration issue. Please contact your system administrator.',
                    canRetry: false
                }

            case 'OAuthSignin':
            case 'OAuthCallback':
            case 'OAuthCreateAccount':
                return {
                    type: 'authorization',
                    code: 'OAUTH_ERROR',
                    message: `OAuth error: ${errorString}`,
                    userMessage: 'There was an error with Google sign in. Please try again or use email/password.',
                    canRetry: true
                }

            case 'EmailSignin':
            case 'EmailCreateAccount':
                return {
                    type: 'validation',
                    code: 'EMAIL_ERROR',
                    message: `Email authentication error: ${errorString}`,
                    userMessage: 'There was an error with email authentication. Please check your email and try again.',
                    canRetry: true
                }

            case 'SessionRequired':
                return {
                    type: 'authorization',
                    code: 'SESSION_REQUIRED',
                    message: 'Valid session required for this action',
                    userMessage: 'You need to be signed in to access this page. Please sign in and try again.',
                    canRetry: true
                }

            default:
                return {
                    type: 'unknown',
                    code: 'NEXTAUTH_ERROR',
                    message: `NextAuth error: ${errorString}`,
                    userMessage: 'An authentication error occurred. Please try again.',
                    canRetry: true
                }
        }
    }

    /**
     * Handles JavaScript Error objects
     */
    private static handleJavaScriptError(error: Error, context: string): AuthError {
        // Network-related errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return this.createNetworkError(error)
        }

        // Timeout errors
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
            return {
                type: 'network',
                code: 'TIMEOUT',
                message: `Request timeout in ${context}`,
                userMessage: 'The request timed out. Please check your connection and try again.',
                canRetry: true,
                details: { timeout: true }
            }
        }

        // Validation errors
        if (error.name === 'ValidationError' || error.message.includes('validation')) {
            return {
                type: 'validation',
                code: 'VALIDATION_ERROR',
                message: error.message,
                userMessage: 'Please check your input and try again.',
                canRetry: true
            }
        }

        // Generic JavaScript error
        return {
            type: 'unknown',
            code: 'JAVASCRIPT_ERROR',
            message: `${error.name}: ${error.message}`,
            userMessage: 'An unexpected error occurred. Please try again.',
            canRetry: true,
            details: { stack: error.stack }
        }
    }

    /**
     * Creates a network error object
     */
    private static createNetworkError(error: any): AuthError {
        const details: NetworkErrorDetails = {
            isOnline: navigator?.onLine ?? true
        }

        // Extract HTTP status if available
        if (error.status) {
            details.status = error.status
            details.statusText = error.statusText
        }

        let userMessage = 'A network error occurred. Please check your connection and try again.'

        if (!details.isOnline) {
            userMessage = 'You appear to be offline. Please check your internet connection and try again.'
        } else if (details.status) {
            if (details.status >= 500) {
                userMessage = 'The authentication service is temporarily unavailable. Please try again in a few moments.'
            } else if (details.status === 429) {
                userMessage = 'Too many sign in attempts. Please wait a moment before trying again.'
            } else if (details.status >= 400) {
                userMessage = 'There was an error with your request. Please try again.'
            }
        }

        return {
            type: 'network',
            code: 'NETWORK_ERROR',
            message: `Network error: ${error.message || 'Connection failed'}`,
            userMessage,
            canRetry: true,
            details
        }
    }

    /**
     * Creates an unknown error object
     */
    private static createUnknownError(error: any): AuthError {
        return {
            type: 'unknown',
            code: 'UNKNOWN_ERROR',
            message: `Unknown error: ${JSON.stringify(error)}`,
            userMessage: 'An unexpected error occurred. Please try again or contact support.',
            canRetry: true,
            details: error
        }
    }

    /**
     * Determines if an error is network-related
     */
    private static isNetworkError(error: any): boolean {
        if (!error) return false

        // Check for common network error indicators
        const networkIndicators = [
            'fetch',
            'network',
            'connection',
            'timeout',
            'offline',
            'ENOTFOUND',
            'ECONNREFUSED',
            'ETIMEDOUT'
        ]

        const errorString = error.toString().toLowerCase()
        return networkIndicators.some(indicator => errorString.includes(indicator))
    }

    /**
     * Logs authentication errors with appropriate detail level
     */
    static logError(error: AuthError, context: string = 'auth'): void {
        const logData = {
            type: error.type,
            code: error.code,
            message: error.message,
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator?.userAgent,
            url: window?.location?.href
        }

        // Include details for non-sensitive errors
        if (error.type === 'network' || error.type === 'configuration') {
            (logData as any).details = error.details
        }

        // Use appropriate log level based on error type
        switch (error.type) {
            case 'network':
                console.warn('Auth Network Error:', logData)
                break
            case 'configuration':
                console.error('Auth Configuration Error:', logData)
                break
            case 'authorization':
                console.info('Auth Authorization Error:', logData)
                break
            case 'validation':
                console.info('Auth Validation Error:', logData)
                break
            default:
                console.error('Auth Unknown Error:', logData)
        }
    }

    /**
     * Creates user-friendly error messages for form display
     */
    static getFormErrorMessage(error: AuthError): string {
        return error.userMessage
    }

    /**
     * Determines if an error should trigger a retry mechanism
     */
    static shouldRetry(error: AuthError): boolean {
        return error.canRetry && (error.type === 'network' || error.code === 'TIMEOUT')
    }

    /**
     * Gets retry delay in milliseconds based on error type
     */
    static getRetryDelay(error: AuthError, attemptNumber: number = 1): number {
        if (!this.shouldRetry(error)) return 0

        // Exponential backoff for network errors
        if (error.type === 'network') {
            return Math.min(1000 * Math.pow(2, attemptNumber - 1), 10000)
        }

        // Fixed delay for other retryable errors
        return 2000
    }
}

/**
 * Hook for handling authentication errors in React components
 */
export function useAuthErrorHandler() {
    const handleError = (error: any, context: string = 'authentication') => {
        const authError = AuthErrorHandler.handleAuthError(error, context)
        AuthErrorHandler.logError(authError, context)
        return authError
    }

    return { handleError }
}