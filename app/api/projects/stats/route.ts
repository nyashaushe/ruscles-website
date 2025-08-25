import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/projects/stats - Get project statistics
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get counts for each status
        const [
            total,
            planning,
            inProgress,
            active,
            onHold,
            completed,
            cancelled
        ] = await Promise.all([
            prisma.project.count(),
            prisma.project.count({ where: { status: 'PLANNING' } }),
            prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
            prisma.project.count({ where: { status: 'ACTIVE' } }),
            prisma.project.count({ where: { status: 'ON_HOLD' } }),
            prisma.project.count({ where: { status: 'COMPLETED' } }),
            prisma.project.count({ where: { status: 'CANCELLED' } }),
        ])

        // Calculate active projects (in progress + active)
        const activeProjects = inProgress + active

        return NextResponse.json({
            total,
            active: activeProjects,
            completed,
            planning,
            inProgress,
            onHold,
            cancelled,
        })
    } catch (error) {
        console.error('Error fetching project stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch project stats' },
            { status: 500 }
        )
    }
}
