import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json()
        const { formIds, updates } = body

        if (!formIds || !Array.isArray(formIds) || formIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Form IDs are required' },
                { status: 400 }
            )
        }

        const updateData: any = {}
        if (updates.status) updateData.status = updates.status
        if (updates.priority) updateData.priority = updates.priority
        if (updates.assignedTo) updateData.assignedToId = updates.assignedTo
        if (updates.notes !== undefined) updateData.notes = updates.notes
        if (updates.tags) updateData.tags = updates.tags

        // Update all specified forms
        await prisma.formSubmission.updateMany({
            where: {
                id: {
                    in: formIds
                }
            },
            data: updateData
        })

        return NextResponse.json({
            success: true,
            message: `Updated ${formIds.length} form submissions`
        })

    } catch (error) {
        console.error('Error bulk updating form submissions:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to bulk update form submissions' },
            { status: 500 }
        )
    }
}
