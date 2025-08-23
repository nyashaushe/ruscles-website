import { NextResponse } from 'next/server'
import { checkDatabaseConnection, getDatabaseStats } from '@/lib/db'

export async function GET() {
    try {
        const connectionCheck = await checkDatabaseConnection()

        if (!connectionCheck.success) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Database connection failed',
                    error: connectionCheck.error
                },
                { status: 500 }
            )
        }

        const stats = await getDatabaseStats()

        return NextResponse.json({
            status: 'healthy',
            message: 'Database is running and accessible',
            timestamp: new Date().toISOString(),
            stats: stats.success ? stats.stats : null,
        })
    } catch (error) {
        return NextResponse.json(
            {
                status: 'error',
                message: 'Failed to check database health',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
