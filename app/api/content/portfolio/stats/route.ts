import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/content/portfolio/stats - Get portfolio statistics
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get counts for portfolio items
        const [
            total,
            visible,
            hidden,
            featured,
            newThisMonth,
            newThisYear,
            totalValue
        ] = await Promise.all([
            prisma.portfolioItem.count(),
            prisma.portfolioItem.count({ where: { isVisible: true } }),
            prisma.portfolioItem.count({ where: { isVisible: false } }),
            prisma.portfolioItem.count({ where: { isFeatured: true } }),
            prisma.portfolioItem.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            }),
            prisma.portfolioItem.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), 0, 1)
                    }
                }
            }),
            prisma.portfolioItem.aggregate({
                _sum: { projectValue: true }
            })
        ])

        // Get category distribution
        const categoryStats = await prisma.portfolioItem.groupBy({
            by: ['serviceCategory'],
            _count: { serviceCategory: true }
        })

        return NextResponse.json({
            total,
            visible,
            hidden,
            featured,
            newThisMonth,
            newThisYear,
            totalValue: totalValue._sum.projectValue || 0,
            categoryDistribution: categoryStats.map(stat => ({
                category: stat.serviceCategory,
                count: stat._count.serviceCategory
            }))
        })
    } catch (error) {
        console.error('Error fetching portfolio stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch portfolio stats' },
            { status: 500 }
        )
    }
}
