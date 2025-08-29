'use client'

import { CredentialsSigninForm } from './credentials-signin-form'

export function AuthDemo() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <CredentialsSigninForm
                onSuccess={() => console.log('Success!')}
                callbackUrl="/admin"
            />
        </div>
    )
}