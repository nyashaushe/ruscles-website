import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { AuthErrorHandler, useAuthErrorHandler } from '@/lib/auth/error-handler'

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: true
})

describe('AuthErrorHandler', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Reset navigator.onLine
        Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: true
        })
    })

    describe('handleAuthError', () => {
        it('should handle NextAuth CredentialsSignin error', () => {
            const error = AuthErrorHandler.handleAuthError('CredentialsSignin')

            expect(error.type).toBe('validation')
            expect(error.code).toBe('INVALID_CREDENTIALS')
            expect(error.userMessage).toContain('Invalid email or password')
            expect(error.canRetry).toBe(true)
        })

        it('should handle NextAuth AccessDenied error', () => {
            const error = AuthErrorHandler.handleAuthError('AccessDenied')

            expect(error.type).toBe('authorization')
            expect(error.code).toBe('ACCESS_DENIED')
            expect(error.userMessage).toContain('Access denied')
            expect(error.canRetry).toBe(false)
        })

        it('should handle NextAuth Configuration error', () => {
            const error = AuthErrorHandler.handleAuthError('Configuration')

            expect(error.type).toBe('configuration')
            expect(error.code).toBe('CONFIG_ERROR')
            expect(error.userMessage).toContain('configuration issue')
            expect(error.canRetry).toBe(false)
        })

        it('should handle OAuth errors', () => {
            const error = AuthErrorHandler.handleAuthError('OAuthSignin')

            expect(error.type).toBe('authorization')
            expect(error.code).toBe('OAUTH_ERROR')
            expect(error.userMessage).toContain('Google sign in')
            expect(error.canRetry).toBe(true)
        })

        it('should handle network errors', () => {
            const networkError = new Error('fetch failed')
            const error = AuthErrorHandler.handleAuthError(networkError)

            expect(error.type).toBe('network')
            expect(error.code).toBe('NETWORK_ERROR')
            expect(error.userMessage).toContain('network error')
            expect(error.canRetry).toBe(true)
        })

        it('should handle timeout errors', () => {
            const timeoutError = new Error('Request timeout')
            const error = AuthErrorHandler.handleAuthError(timeoutError)

            expect(error.type).toBe('network')
            expect(error.code).toBe('TIMEOUT')
            expect(error.userMessage).toContain('timed out')
            expect(error.canRetry).toBe(true)
        })

        it('should handle offline state', () => {
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: false
            })

            const networkError = new Error('Network request failed')
            const error = AuthErrorHandler.handleAuthError(networkError)

            expect(error.type).toBe('network')
            expect(error.userMessage).toContain('offline')
        })

        it('should handle unknown errors', () => {
            const unknownError = { weird: 'object' }
            const error = AuthErrorHandler.handleAuthError(unknownError)

            expect(error.type).toBe('unknown')
            expect(error.code).toBe('UNKNOWN_ERROR')
            expect(error.canRetry).toBe(true)
        })
    })

    describe('shouldRetry', () => {
        it('should return true for network errors', () => {
            const error = AuthErrorHandler.handleAuthError(new Error('fetch failed'))
            expect(AuthErrorHandler.shouldRetry(error)).toBe(true)
        })

        it('should return false for authorization errors', () => {
            const error = AuthErrorHandler.handleAuthError('AccessDenied')
            expect(AuthErrorHandler.shouldRetry(error)).toBe(false)
        })

        it('should return false for configuration errors', () => {
            const error = AuthErrorHandler.handleAuthError('Configuration')
            expect(AuthErrorHandler.shouldRetry(error)).toBe(false)
        })

        it('should return true for timeout errors', () => {
            const error = AuthErrorHandler.handleAuthError(new Error('timeout'))
            expect(AuthErrorHandler.shouldRetry(error)).toBe(true)
        })
    })

    describe('getRetryDelay', () => {
        it('should return 0 for non-retryable errors', () => {
            const error = AuthErrorHandler.handleAuthError('AccessDenied')
            expect(AuthErrorHandler.getRetryDelay(error)).toBe(0)
        })

        it('should return exponential backoff for network errors', () => {
            const error = AuthErrorHandler.handleAuthError(new Error('fetch failed'))

            expect(AuthErrorHandler.getRetryDelay(error, 1)).toBe(1000)
            expect(AuthErrorHandler.getRetryDelay(error, 2)).toBe(2000)
            expect(AuthErrorHandler.getRetryDelay(error, 3)).toBe(4000)
        })

        it('should cap retry delay at 10 seconds', () => {
            const error = AuthErrorHandler.handleAuthError(new Error('fetch failed'))
            expect(AuthErrorHandler.getRetryDelay(error, 10)).toBe(10000)
        })

        it('should return fixed delay for timeout errors', () => {
            const error = AuthErrorHandler.handleAuthError(new Error('timeout'))
            expect(AuthErrorHandler.getRetryDelay(error, 1)).toBe(2000)
            expect(AuthErrorHandler.getRetryDelay(error, 5)).toBe(2000)
        })
    })

    describe('logError', () => {
        let consoleSpy: any

        beforeEach(() => {
            consoleSpy = {
                warn: vi.spyOn(console, 'warn').mockImplementation(() => { }),
                error: vi.spyOn(console, 'error').mockImplementation(() => { }),
                info: vi.spyOn(console, 'info').mockImplementation(() => { })
            }
        })

        afterEach(() => {
            consoleSpy.warn.mockRestore()
            consoleSpy.error.mockRestore()
            consoleSpy.info.mockRestore()
        })

        it('should log network errors as warnings', () => {
            const error = AuthErrorHandler.handleAuthError(new Error('fetch failed'))
            AuthErrorHandler.logError(error, 'test')

            expect(consoleSpy.warn).toHaveBeenCalledWith(
                'Auth Network Error:',
                expect.objectContaining({
                    type: 'network',
                    context: 'test'
                })
            )
        })

        it('should log configuration errors as errors', () => {
            const error = AuthErrorHandler.handleAuthError('Configuration')
            AuthErrorHandler.logError(error, 'test')

            expect(consoleSpy.error).toHaveBeenCalledWith(
                'Auth Configuration Error:',
                expect.objectContaining({
                    type: 'configuration',
                    context: 'test'
                })
            )
        })

        it('should log authorization errors as info', () => {
            const error = AuthErrorHandler.handleAuthError('AccessDenied')
            AuthErrorHandler.logError(error, 'test')

            expect(consoleSpy.info).toHaveBeenCalledWith(
                'Auth Authorization Error:',
                expect.objectContaining({
                    type: 'authorization',
                    context: 'test'
                })
            )
        })

        it('should log validation errors as info', () => {
            const error = AuthErrorHandler.handleAuthError('CredentialsSignin')
            AuthErrorHandler.logError(error, 'test')

            expect(consoleSpy.info).toHaveBeenCalledWith(
                'Auth Validation Error:',
                expect.objectContaining({
                    type: 'validation',
                    context: 'test'
                })
            )
        })

        it('should log unknown errors as errors', () => {
            const error = AuthErrorHandler.handleAuthError({ unknown: 'error' })
            AuthErrorHandler.logError(error, 'test')

            expect(consoleSpy.error).toHaveBeenCalledWith(
                'Auth Unknown Error:',
                expect.objectContaining({
                    type: 'unknown',
                    context: 'test'
                })
            )
        })
    })
})

// Test component for useAuthErrorHandler hook
function TestComponent({ error, context }: { error: any; context?: string }) {
    const { handleError } = useAuthErrorHandler()
    const [authError, setAuthError] = React.useState<any>(null)

    const processError = () => {
        const result = handleError(error, context)
        setAuthError(result)
    }

    return (
        <div>
            <button onClick={processError}>Process Error</button>
            {authError && (
                <div data-testid="error-result">
                    <div data-testid="error-type">{authError.type}</div>
                    <div data-testid="error-message">{authError.userMessage}</div>
                    <div data-testid="error-retry">{authError.canRetry.toString()}</div>
                </div>
            )}
        </div>
    )
}

describe('useAuthErrorHandler', () => {
    it('should handle errors and return formatted error object', async () => {
        render(<TestComponent error="CredentialsSignin" context="test" />)

        fireEvent.click(screen.getByText('Process Error'))

        await waitFor(() => {
            expect(screen.getByTestId('error-type')).toHaveTextContent('validation')
            expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid email or password')
            expect(screen.getByTestId('error-retry')).toHaveTextContent('true')
        })
    })

    it('should handle network errors', async () => {
        const networkError = new Error('fetch failed')
        render(<TestComponent error={networkError} context="network-test" />)

        fireEvent.click(screen.getByText('Process Error'))

        await waitFor(() => {
            expect(screen.getByTestId('error-type')).toHaveTextContent('network')
            expect(screen.getByTestId('error-message')).toHaveTextContent('network error')
            expect(screen.getByTestId('error-retry')).toHaveTextContent('true')
        })
    })
})