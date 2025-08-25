export function checkProductionEnvironment() {
    const requiredEnvVars = [
        'NEXTAUTH_SECRET',
        'NEXTAUTH_URL',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'DATABASE_URL'
    ]

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:', missingVars)
        return false
    }

    console.log('✅ All required environment variables are set')
    return true
}

export function getEnvironmentInfo() {
    return {
        nodeEnv: process.env.NODE_ENV,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
    }
}
