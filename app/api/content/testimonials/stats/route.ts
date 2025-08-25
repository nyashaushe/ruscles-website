import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/content/testimonials/stats - Get testimonial statistics
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get counts for testimonials
        const [
            total,
            visible,
            hidden,
            featured,
            newThisMonth,
            newThisYear,
            averageRating
        ] = await Promise.all([
            prisma.testimonial.count(),
            prisma.testimonial.count({ where: { isVisible: true } }),
            prisma.testimonial.count({ where: { isVisible: false } }),
            prisma.testimonial.count({ where: { isFeatured: true } }),
            prisma.testimonial.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            }),
            prisma.testimonial.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), 0, 1)
                    }
                }
            }),
            prisma.testimonial.aggregate({
                _avg: { rating: true }
            })
        ])

        // Get project type distribution
        const projectTypeStats = await prisma.testimonial.groupBy({
            by: ['projectType'],
            _count: { projectType: true },
            where: { projectType: { not: null } }
        })

        return NextResponse.json({
            total,
            visible,
            hidden,
            featured,
            newThisMonth,
            newThisYear,
            averageRating: averageRating._avg.rating || 0,
            projectTypeDistribution: projectTypeStats.map(stat => ({
                projectType: stat.projectType,
                count: stat._count.projectType
            }))
        })
    } catch (error) {
        console.error('Error fetching testimonial stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch testimonial stats' },
            { status: 500 }
        )
    }
}
