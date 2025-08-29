export function checkProductionEnvironment() {
    const requiredEnvVars = [
        'NEXTAUTH_SECRET',
        'NEXTAUTH_URL',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'DATABASE_URL',
        'ALLOWED_ADMIN_EMAILS'
    ]

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:', missingVars)
        return false
    }

    // Validate credentials authentication configuration
    const credentialsValidation = validateCredentialsAuthConfig()
    if (!credentialsValidation.isValid) {
        console.error('❌ Credentials authentication configuration errors:', credentialsValidation.errors)
        return false
    }

    console.log('✅ All required environment variables are set')
    console.log('✅ Credentials authentication configuration is valid')
    return true
}

export function getEnvironmentInfo() {
    const credentialsValidation = validateCredentialsAuthConfig()

    return {
        nodeEnv: process.env.NODE_ENV,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasAllowedAdminEmails: !!process.env.ALLOWED_ADMIN_EMAILS,
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
        allowedAdminEmails: process.env.ALLOWED_ADMIN_EMAILS ? 'Set' : 'Not set',
        credentialsAuthConfig: {
            isValid: credentialsValidation.isValid,
            allowedEmailsCount: credentialsValidation.allowedEmailsCount,
            errors: credentialsValidation.errors
        }
    }
}

export interface CredentialsAuthValidation {
    isValid: boolean
    allowedEmailsCount: number
    errors: string[]
}

export function validateCredentialsAuthConfig(): CredentialsAuthValidation {
    const errors: string[] = []
    let allowedEmailsCount = 0

    // Validate ALLOWED_ADMIN_EMAILS format and content
    const allowedEmails = process.env.ALLOWED_ADMIN_EMAILS
    if (!allowedEmails) {
        errors.push('ALLOWED_ADMIN_EMAILS is required for credentials authentication')
    } else {
        const emails = allowedEmails.split(',').map(e => e.trim()).filter(e => e.length > 0)
        allowedEmailsCount = emails.length

        if (emails.length === 0) {
            errors.push('ALLOWED_ADMIN_EMAILS must contain at least one email address')
        } else {
            // Validate email format for each email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            const invalidEmails = emails.filter(email => !emailRegex.test(email))

            if (invalidEmails.length > 0) {
                errors.push(`Invalid email format in ALLOWED_ADMIN_EMAILS: ${invalidEmails.join(', ')}`)
            }

            // Check for duplicate emails
            const uniqueEmails = new Set(emails.map(e => e.toLowerCase()))
            if (uniqueEmails.size !== emails.length) {
                errors.push('ALLOWED_ADMIN_EMAILS contains duplicate email addresses')
            }
        }
    }

    // Validate NextAuth configuration for credentials provider
    if (!process.env.NEXTAUTH_SECRET) {
        errors.push('NEXTAUTH_SECRET is required for secure session handling')
    } else if (process.env.NEXTAUTH_SECRET.length < 32) {
        errors.push('NEXTAUTH_SECRET should be at least 32 characters long for security')
    }

    if (!process.env.NEXTAUTH_URL) {
        errors.push('NEXTAUTH_URL is required for proper callback handling')
    } else {
        try {
            new URL(process.env.NEXTAUTH_URL)
        } catch {
            errors.push('NEXTAUTH_URL must be a valid URL')
        }
    }

    return {
        isValid: errors.length === 0,
        allowedEmailsCount,
        errors
    }
}

export function validateGoogleAuthServiceConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check if Google OAuth credentials are available (for fallback)
    if (!process.env.GOOGLE_CLIENT_ID) {
        errors.push('GOOGLE_CLIENT_ID is recommended as fallback authentication method')
    }

    if (!process.env.GOOGLE_CLIENT_SECRET) {
        errors.push('GOOGLE_CLIENT_SECRET is recommended as fallback authentication method')
    }

    // Validate environment for production readiness
    if (process.env.NODE_ENV === 'production') {
        if (process.env.NEXTAUTH_URL?.includes('localhost')) {
            errors.push('NEXTAUTH_URL should not use localhost in production')
        }

        if (process.env.NEXTAUTH_SECRET === 'your-super-secret-key-change-this-in-production') {
            errors.push('NEXTAUTH_SECRET must be changed from default value in production')
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}
