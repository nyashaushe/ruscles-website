'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

function AuthErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    const getErrorMessage = (error: string | null) => {
        switch (error) {
            case 'AccessDenied':
                return 'Access denied. Your Gmail account is not authorized to access this admin portal.'
            case 'Configuration':
                return 'There is a problem with the server configuration.'
            case 'Verification':
                return 'The verification token has expired or has already been used.'
            default:
                return 'An error occurred during authentication. Please try again.'
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-red-600">Authentication Error</CardTitle>
                    <CardDescription>
                        There was a problem signing you in
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant="destructive">
                        <AlertDescription>
                            {getErrorMessage(error)}
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Button asChild className="w-full">
                            <Link href="/auth/signin">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Try Again
                            </Link>
                        </Button>
                    </div>

                    <div className="text-center text-sm text-gray-600">
                        <p>If you continue to have issues, please contact your administrator.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-red-600">Loading...</CardTitle>
                    </CardHeader>
                </Card>
            </div>
        }>
            <AuthErrorContent />
        </Suspense>
    )
}



