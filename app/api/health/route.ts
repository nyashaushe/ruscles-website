import { NextRequest, NextResponse } from 'next/server'
import { getEnvironmentInfo } from '@/lib/production-check'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const envInfo = getEnvironmentInfo()

        // Test database connection
        let dbStatus = 'unknown'
        try {
            await prisma.$queryRaw`SELECT 1`
            dbStatus = 'connected'
        } catch (error) {
            dbStatus = 'error'
            console.error('Database connection error:', error)
        }

        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: envInfo,
            database: dbStatus,
            version: process.env.VERCEL_GIT_COMMIT_SHA || 'local'
        })
    } catch (error) {
        console.error('Health check error:', error)
        return NextResponse.json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
