'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, ArrowLeft, RefreshCw, Mail, Shield, Loader2 } from 'lucide-react'

interface ErrorInfo {
    title: string
    description: string
    suggestion: string
    canRetry: boolean
}

const ERROR_MESSAGES: Record<string, ErrorInfo> = {
    Configuration: {
        title: 'Configuration Error',
        description: 'There is an issue with the authentication configuration.',
        suggestion: 'Please contact your system administrator to resolve this issue.',
        canRetry: false
    },
    AccessDenied: {
        title: 'Access Denied',
        description: 'Your account is not authorized to access this portal.',
        suggestion: 'Please contact your administrator to request access or use an authorized account.',
        canRetry: false
    },
    Verification: {
        title: 'Verification Failed',
        description: 'Unable to verify your account credentials.',
        suggestion: 'Please check your email and password, then try again.',
        canRetry: true
    },
    OAuthSignin: {
        title: 'OAuth Sign In Error',
        description: 'There was an error during the OAuth authentication process.',
        suggestion: 'Please try signing in again or use the email/password option.',
        canRetry: true
    },
    OAuthCallback: {
        title: 'OAuth Callback Error',
        description: 'There was an error processing the OAuth response.',
        suggestion: 'Please try signing in again or contact support if the issue persists.',
        canRetry: true
    },
    OAuthCreateAccount: {
        title: 'Account Creation Error',
        description: 'Unable to create your account during OAuth sign in.',
        suggestion: 'Please try again or contact your administrator.',
        canRetry: true
    },
    EmailCreateAccount: {
        title: 'Email Account Error',
        description: 'Unable to create account with the provided email.',
        suggestion: 'Please verify your email address and try again.',
        canRetry: true
    },
    Callback: {
        title: 'Callback Error',
        description: 'There was an error during the authentication callback.',
        suggestion: 'Please try signing in again.',
        canRetry: true
    },
    OAuthAccountNotLinked: {
        title: 'Account Not Linked',
        description: 'This account is not linked to your profile.',
        suggestion: 'Please use the same sign-in method you used previously.',
        canRetry: true
    },
    EmailSignin: {
        title: 'Email Sign In Error',
        description: 'Unable to send sign in email.',
        suggestion: 'Please check your email address and try again.',
        canRetry: true
    },
    CredentialsSignin: {
        title: 'Invalid Credentials',
        description: 'The email or password you entered is incorrect.',
        suggestion: 'Please check your credentials and try again, or use Google sign in.',
        canRetry: true
    },
    SessionRequired: {
        title: 'Session Required',
        description: 'You need to be signed in to access this page.',
        suggestion: 'Please sign in to continue.',
        canRetry: true
    },
    Default: {
        title: 'Authentication Error',
        description: 'An unexpected error occurred during authentication.',
        suggestion: 'Please try again or contact support if the issue persists.',
        canRetry: true
    }
}

function AuthErrorContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [errorType, setErrorType] = useState<string>('Default')
    const [isRetrying, setIsRetrying] = useState(false)

    useEffect(() => {
        const error = searchParams.get('error')
        if (error && ERROR_MESSAGES[error]) {
            setErrorType(error)
        }
    }, [searchParams])

    const errorInfo = ERROR_MESSAGES[errorType]

    const handleRetry = async () => {
        setIsRetrying(true)
        // Add a small delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 1000))
        router.push('/auth/signin')
    }

    const handleGoBack = () => {
        router.push('/auth/signin')
    }

    const handleContactSupport = () => {
        // In a real app, this might open a support form or email client
        window.location.href = 'mailto:support@example.com?subject=Authentication Error&body=Error Type: ' + errorType
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h1>
                    <p className="text-gray-600">
                        We encountered an issue while trying to sign you in
                    </p>
                </div>

                {/* Error Details */}
                <Card className="w-full mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg text-red-600 flex items-center">
                            <AlertTriangle className="mr-2 h-5 w-5" />
                            {errorInfo.title}
                        </CardTitle>
                        <CardDescription>
                            {errorInfo.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert>
                            <Shield className="h-4 w-4" />
                            <AlertDescription>
                                {errorInfo.suggestion}
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {errorInfo.canRetry && (
                        <Button
                            onClick={handleRetry}
                            disabled={isRetrying}
                            className="w-full"
                            size="lg"
                        >
                            {isRetrying ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Redirecting...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Try Again
                                </>
                            )}
                        </Button>
                    )}

                    <Button
                        onClick={handleGoBack}
                        variant="outline"
                        className="w-full"
                        size="lg"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Sign In
                    </Button>

                    <Button
                        onClick={handleContactSupport}
                        variant="ghost"
                        className="w-full"
                        size="lg"
                    >
                        <Mail className="mr-2 h-4 w-4" />
                        Contact Support
                    </Button>
                </div>

                {/* Debug Information (Development Only) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Information</h3>
                        <div className="text-xs text-gray-600 space-y-1">
                            <div>Error Type: {errorType}</div>
                            <div>URL: {window.location.href}</div>
                            <div>Timestamp: {new Date().toISOString()}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
                <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading...</span>
                </div>
            </div>
        }>
            <AuthErrorContent />
        </Suspense>
    )
}