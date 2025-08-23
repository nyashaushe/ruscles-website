import { NextResponse } from 'next/server'
import { resetDatabase } from '@/lib/db'

export async function POST() {
    try {
        // Only allow reset in development
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Database reset is not allowed in production'
                },
                { status: 403 }
            )
        }

        const result = await resetDatabase()

        if (!result.success) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Database reset failed',
                    error: result.error
                },
                { status: 500 }
            )
        }

        return NextResponse.json({
            status: 'success',
            message: 'Database reset successfully',
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        return NextResponse.json(
            {
                status: 'error',
                message: 'Failed to reset database',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
