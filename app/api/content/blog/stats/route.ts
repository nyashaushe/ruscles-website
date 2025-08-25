import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/content/blog/stats - Get blog statistics
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get counts for each status
        const [
            total,
            published,
            draft,
            scheduled,
            archived
        ] = await Promise.all([
            prisma.contentItem.count({ where: { type: 'BLOG_POST' } }),
            prisma.contentItem.count({ where: { type: 'BLOG_POST', status: 'PUBLISHED' } }),
            prisma.contentItem.count({ where: { type: 'BLOG_POST', status: 'DRAFT' } }),
            prisma.contentItem.count({ where: { type: 'BLOG_POST', status: 'SCHEDULED' } }),
            prisma.contentItem.count({ where: { type: 'BLOG_POST', status: 'ARCHIVED' } }),
        ])

        return NextResponse.json({
            total,
            published,
            draft,
            scheduled,
            archived,
        })
    } catch (error) {
        console.error('Error fetching blog stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch blog stats' },
            { status: 500 }
        )
    }
}
