import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function GET() {
  try {
    // Get total count
    const total = await prisma.formSubmission.count()

    // Get counts by status
    const byStatus = await prisma.formSubmission.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    // Get counts by priority
    const byPriority = await prisma.formSubmission.groupBy({
      by: ['priority'],
      _count: {
        priority: true
      }
    })

    // Get counts by type
    const byType = await prisma.formSubmission.groupBy({
      by: ['type'],
      _count: {
        type: true
      }
    })

    // Get recent count (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentCount = await prisma.formSubmission.count({
      where: {
        submittedAt: {
          gte: sevenDaysAgo
        }
      }
    })

    // Transform the data
    const statusStats = byStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>)

    const priorityStats = byPriority.reduce((acc, item) => {
      acc[item.priority] = item._count.priority
      return acc
    }, {} as Record<string, number>)

    const typeStats = byType.reduce((acc, item) => {
      acc[item.type] = item._count.type
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      success: true,
      data: {
        total,
        byStatus: statusStats,
        byPriority: priorityStats,
        byType: typeStats,
        recentCount
      }
    })

  } catch (error) {
    console.error('Error fetching form stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch form statistics' },
      { status: 500 }
    )
  }
}
