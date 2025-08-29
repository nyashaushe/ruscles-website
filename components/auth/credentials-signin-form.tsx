'use client'

import * as React from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EmailInput } from "./email-input"
import { PasswordInput } from "./password-input"
import { Loader2, LogIn, AlertTriangle, Wifi, WifiOff } from "lucide-react"
import { AuthErrorHandler, useAuthErrorHandler, type AuthError } from "@/lib/auth/error-handler"

interface CredentialsSigninFormProps {
    onSuccess?: () => void
    callbackUrl?: string
    className?: string
}

interface FormData {
    email: string
    password: string
}

interface FormErrors {
    email?: string
    password?: string
    general?: string
}

interface RetryState {
    isRetrying: boolean
    attemptCount: number
    nextRetryIn: number
}

export function CredentialsSigninForm({
    onSuccess,
    callbackUrl = '/admin',
    className
}: CredentialsSigninFormProps) {
    const router = useRouter()
    const { handleError } = useAuthErrorHandler()
    const [isLoading, setIsLoading] = React.useState(false)
    const [formData, setFormData] = React.useState<FormData>({
        email: '',
        password: ''
    })
    const [errors, setErrors] = React.useState<FormErrors>({})
    const [currentError, setCurrentError] = React.useState<AuthError | null>(null)
    const [retryState, setRetryState] = React.useState<RetryState>({
        isRetrying: false,
        attemptCount: 0,
        nextRetryIn: 0
    })
    const [isOnline, setIsOnline] = React.useState(navigator?.onLine ?? true)

    // Monitor network status
    React.useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    // Handle retry countdown
    React.useEffect(() => {
        if (retryState.nextRetryIn > 0) {
            const timer = setTimeout(() => {
                setRetryState(prev => ({
                    ...prev,
                    nextRetryIn: prev.nextRetryIn - 1
                }))
            }, 1000)

            return () => clearTimeout(timer)
        }
    }, [retryState.nextRetryIn])

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address'
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (field: keyof FormData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }))

        // Clear field-specific error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }))
        }

        // Clear general error when user makes changes
        if (errors.general) {
            setErrors(prev => ({
                ...prev,
                general: undefined
            }))
        }

        // Clear current error when user makes changes
        if (currentError) {
            setCurrentError(null)
        }
    }

    const performSignIn = async (): Promise<void> => {
        const result = await signIn('credentials', {
            email: formData.email,
            password: formData.password,
            redirect: false
        })

        if (result?.error) {
            const authError = handleError(result.error, 'credentials-signin')
            setCurrentError(authError)
            setErrors({ general: authError.userMessage })
        } else if (result?.ok) {
            // Success - reset retry state and redirect
            setRetryState({ isRetrying: false, attemptCount: 0, nextRetryIn: 0 })
            setCurrentError(null)

            if (onSuccess) {
                onSuccess()
            } else {
                router.push(callbackUrl)
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        // Check if offline
        if (!isOnline) {
            const offlineError = handleError(new Error('No internet connection'), 'credentials-signin')
            setCurrentError(offlineError)
            setErrors({ general: offlineError.userMessage })
            return
        }

        setIsLoading(true)
        setErrors({})
        setCurrentError(null)

        try {
            await performSignIn()
        } catch (error) {
            const authError = handleError(error, 'credentials-signin')
            setCurrentError(authError)
            setErrors({ general: authError.userMessage })
        } finally {
            setIsLoading(false)
        }
    }

    const handleRetry = async () => {
        if (!currentError || !AuthErrorHandler.shouldRetry(currentError)) {
            return
        }

        const newAttemptCount = retryState.attemptCount + 1
        const retryDelay = AuthErrorHandler.getRetryDelay(currentError, newAttemptCount)

        setRetryState({
            isRetrying: true,
            attemptCount: newAttemptCount,
            nextRetryIn: Math.ceil(retryDelay / 1000)
        })

        // Wait for the retry delay
        await new Promise(resolve => setTimeout(resolve, retryDelay))

        setRetryState(prev => ({ ...prev, isRetrying: false, nextRetryIn: 0 }))

        // Retry the sign in
        setIsLoading(true)
        setErrors({})
        setCurrentError(null)

        try {
            await performSignIn()
        } catch (error) {
            const authError = handleError(error, 'credentials-signin-retry')
            setCurrentError(authError)
            setErrors({ general: authError.userMessage })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className={className}>
            <CardHeader className="text-center">
                <CardTitle className="text-xl font-semibold">Sign in with Email</CardTitle>
                <CardDescription>
                    Enter your Google email and password to access the admin portal
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Network Status Indicator */}
                    {!isOnline && (
                        <Alert variant="destructive">
                            <WifiOff className="h-4 w-4" />
                            <AlertDescription>
                                You are currently offline. Please check your internet connection.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Error Display with Enhanced Information */}
                    {errors.general && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="space-y-2">
                                <div>{errors.general}</div>

                                {/* Show retry option for retryable errors */}
                                {currentError && AuthErrorHandler.shouldRetry(currentError) && !retryState.isRetrying && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleRetry}
                                        disabled={isLoading || retryState.nextRetryIn > 0}
                                        className="mt-2"
                                    >
                                        {retryState.nextRetryIn > 0 ? (
                                            `Retry in ${retryState.nextRetryIn}s`
                                        ) : (
                                            <>
                                                <Wifi className="mr-1 h-3 w-3" />
                                                Retry
                                            </>
                                        )}
                                    </Button>
                                )}

                                {/* Show retry progress */}
                                {retryState.isRetrying && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                        Retrying... (Attempt {retryState.attemptCount})
                                    </div>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    <EmailInput
                        id="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        error={errors.email}
                        disabled={isLoading}
                        autoComplete="email"
                        required
                    />

                    <PasswordInput
                        id="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        error={errors.password}
                        disabled={isLoading}
                        autoComplete="current-password"
                        required
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={isLoading || !formData.email || !formData.password}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                <LogIn className="mr-2 h-4 w-4" />
                                Sign in
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}