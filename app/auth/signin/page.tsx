'use client'

import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Shield } from 'lucide-react'

export default function SignInPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Check if user is already authenticated
        getSession().then((session) => {
            if (session) {
                router.push('/admin')
            }
        })
    }, [router])

    const handleGoogleSignIn = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const result = await signIn('google', {
                callbackUrl: '/admin',
                redirect: false
            })

            if (result?.error) {
                setError('Access denied. Please contact your administrator.')
            } else if (result?.ok) {
                router.push('/admin')
            }
        } catch (error) {
            setError('An error occurred during sign in. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
                    <CardDescription>
                        Sign in with your authorized Gmail account to access the admin panel
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Button
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="w-full"
                            size="lg"
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Mail className="mr-2 h-4 w-4" />
                            )}
                            Sign in with Google
                        </Button>
                    </div>

                    <div className="text-center text-sm text-gray-600">
                        <p>Only authorized Gmail accounts can access this portal.</p>
                        <p className="mt-1">Contact your administrator if you need access.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}



