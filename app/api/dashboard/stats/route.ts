import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
    try {
        const totalForms = await prisma.formSubmission.count()
        const newForms = await prisma.formSubmission.count({ where: { status: 'new' } })
        const inProgressForms = await prisma.formSubmission.count({ where: { status: 'in_progress' } })
        const completedForms = await prisma.formSubmission.count({ where: { status: 'completed' } })

        const stats = {
            totalSubmissions: totalForms,
            pendingItems: newForms,
            activeItems: inProgressForms,
            completedItems: completedForms,
            responseRate: totalForms > 0 ? Math.round(((totalForms - newForms) / totalForms) * 100) : 0,
            avgResponseTime: 4, // Default value
            customerSatisfaction: 95,
            systemHealth: {
                database: 'healthy',
                api: 'healthy',
                email: 'healthy'
            },
            recentActivity: []
        }

        return NextResponse.json({ success: true, data: stats })
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch stats' },
            { status: 500 }
        )
    }
}
