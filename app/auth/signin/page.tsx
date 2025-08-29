'use client'

import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { CredentialsSigninForm } from '@/components/auth/credentials-signin-form'
import { Loader2, Mail, Shield, AlertTriangle, WifiOff } from 'lucide-react'
import { AuthErrorHandler, useAuthErrorHandler } from '@/lib/auth/error-handler'

function SignInContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { handleError } = useAuthErrorHandler()
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [googleError, setGoogleError] = useState<string | null>(null)
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)

    useEffect(() => {
        // Check if user is already authenticated
        getSession().then((session) => {
            if (session) {
                router.push('/admin')
            }
        })

        // Check for error from URL params (from NextAuth error redirect)
        const error = searchParams.get('error')
        if (error) {
            const authError = handleError(error, 'oauth-signin')
            setGoogleError(authError.userMessage)
        }
    }, [router, searchParams, handleError])

    // Monitor network status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        if (typeof window !== 'undefined') {
            window.addEventListener('online', handleOnline)
            window.addEventListener('offline', handleOffline)

            return () => {
                window.removeEventListener('online', handleOnline)
                window.removeEventListener('offline', handleOffline)
            }
        }
    }, [])

    const handleGoogleSignIn = async () => {
        // Check if offline
        if (!isOnline) {
            const offlineError = handleError(new Error('No internet connection'), 'oauth-signin')
            setGoogleError(offlineError.userMessage)
            return
        }

        setIsGoogleLoading(true)
        setGoogleError(null)

        try {
            const result = await signIn('google', {
                callbackUrl: '/admin',
                redirect: false
            })

            if (result?.error) {
                const authError = handleError(result.error, 'oauth-signin')
                setGoogleError(authError.userMessage)
            } else if (result?.ok) {
                router.push('/admin')
            }
        } catch (error) {
            const authError = handleError(error, 'oauth-signin')
            setGoogleError(authError.userMessage)
        } finally {
            setIsGoogleLoading(false)
        }
    }

    const handleCredentialsSuccess = () => {
        router.push('/admin')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="w-full max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                        <Shield className="h-8 w-8 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
                    <p className="text-gray-600 max-w-md mx-auto">
                        Sign in with your authorized account to access the admin panel
                    </p>
                </div>

                {/* Authentication Options */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Google OAuth Option */}
                    <Card className="w-full">
                        <CardHeader className="text-center">
                            <CardTitle className="text-xl font-semibold">Quick Sign In</CardTitle>
                            <CardDescription>
                                Use your Google account for fast, secure access
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Network Status Indicator */}
                            {!isOnline && (
                                <Alert variant="destructive">
                                    <WifiOff className="h-4 w-4" />
                                    <AlertDescription>
                                        You are currently offline. Please check your internet connection.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Google OAuth Error Display */}
                            {googleError && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>{googleError}</AlertDescription>
                                </Alert>
                            )}

                            <Button
                                onClick={handleGoogleSignIn}
                                disabled={isGoogleLoading}
                                className="w-full"
                                size="lg"
                                variant="outline"
                            >
                                {isGoogleLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Mail className="mr-2 h-4 w-4" />
                                )}
                                Sign in with Google
                            </Button>

                            <div className="text-center text-sm text-gray-500">
                                <p>One-click authentication</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Credentials Option */}
                    <CredentialsSigninForm
                        onSuccess={handleCredentialsSuccess}
                        callbackUrl="/admin"
                        className="w-full"
                    />
                </div>

                {/* Footer Information */}
                <div className="mt-8 text-center">
                    <div className="inline-flex items-center space-x-4 text-sm text-gray-600 bg-white/50 backdrop-blur-sm rounded-lg px-6 py-3">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Secure Authentication</span>
                        </div>
                        <Separator orientation="vertical" className="h-4" />
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Admin Access Only</span>
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-500 max-w-lg mx-auto">
                        Only authorized accounts can access this portal.
                        Contact your administrator if you need access or encounter issues.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function SignInPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading...</span>
                </div>
            </div>
        }>
            <SignInContent />
        </Suspense>
    )
}



