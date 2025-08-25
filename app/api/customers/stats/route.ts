import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/customers/stats - Get customer statistics
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get counts for customers
        const [
            total,
            active,
            inactive,
            newThisMonth,
            newThisYear
        ] = await Promise.all([
            prisma.user.count({ where: { role: 'USER' } }),
            prisma.user.count({ where: { role: 'USER', isActive: true } }),
            prisma.user.count({ where: { role: 'USER', isActive: false } }),
            prisma.user.count({
                where: {
                    role: 'USER',
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            }),
            prisma.user.count({
                where: {
                    role: 'USER',
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), 0, 1)
                    }
                }
            }),
        ])

        return NextResponse.json({
            total,
            active,
            inactive,
            newThisMonth,
            newThisYear,
        })
    } catch (error) {
        console.error('Error fetching customer stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch customer stats' },
            { status: 500 }
        )
    }
}
