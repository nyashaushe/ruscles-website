import { NextResponse } from 'next/server'
import { seedDatabase } from '@/lib/db'

export async function POST() {
    try {
        const result = await seedDatabase()

        if (!result.success) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Database seeding failed',
                    error: result.error
                },
                { status: 500 }
            )
        }

        return NextResponse.json({
            status: 'success',
            message: 'Database seeded successfully',
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        return NextResponse.json(
            {
                status: 'error',
                message: 'Failed to seed database',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
